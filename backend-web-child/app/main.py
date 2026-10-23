import os
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from .database import Base, engine, get_db
from . import models
from .schemas import CaregiverUpdate, ChildCreate, DailyNoteCreate, GrowthRecordCreate, HealthRecordCreate, NeedItemCreate, NeedItemUpdate, ReminderCreate, ReminderUpdate


app = FastAPI(title="Web Child API", version="1.0.0")
origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def create_tables() -> None:
    # The checked-in SQL schema supplies constraints and indexes; create_all also
    # makes a fresh development database usable when the SQL file was applied.
    Base.metadata.create_all(bind=engine)
    # create_all does not add columns to tables that already exist.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS address TEXT"))
        connection.execute(text("ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS phone TEXT"))
        connection.execute(text("ALTER TABLE need_items ADD COLUMN IF NOT EXISTS section TEXT"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_need_items_name_ci ON need_items (LOWER(BTRIM(name)))"))


def child_output(child: models.Child) -> dict:
    return {
        "id": child.id,
        "code": child.code,
        "name": child.name,
        "nickname": child.nickname,
        "dateOfBirth": child.date_of_birth.isoformat(),
        "gender": child.gender,
        "entryDate": child.entry_date.isoformat(),
        "health": child.health_status,
        "condition": child.condition,
        "caregiver": child.caregiver.name if child.caregiver else "",
        "background": child.background,
        "allergies": [item.description for item in child.allergies],
        "specialConditions": [item.description for item in child.special_conditions],
    }


def require_child(db: Session, child_id: int) -> models.Child:
    child = db.scalar(select(models.Child).where(models.Child.id == child_id))
    if child is None:
        raise HTTPException(status_code=404, detail="Anak tidak ditemukan")
    return child


def age_in_months(birth: date, on_date: date) -> int:
    return max(0, (on_date.year - birth.year) * 12 + on_date.month - birth.month - (on_date.day < birth.day))


def assessment_output(row: models.GrowthAssessment) -> dict:
    return {"status": row.status, "assessedAt": row.assessed_at.isoformat(), "summary": row.summary,
        "disclaimer": row.disclaimer, "indicators": [{"type": x.indicator_type, "status": x.status,
        "value": float(x.value), "unit": x.unit, "interpretation": x.interpretation} for x in row.indicators]}


# WHO simplified field-table thresholds at the ages in this demo dataset,
# ordered as z = -3, -2, -1, 0, +1, +2, +3. Interpolation is approximate.
WHO_GIRLS_HFA = {37:[84.2,88,91.9,95.7,99.6,103.4,107.3],38:[84.7,88.6,92.5,96.4,100.3,104.2,108.1],39:[85.3,89.2,93.1,97.1,101,105,108.9],40:[85.8,89.8,93.8,97.7,101.7,105.7,109.7],41:[86.3,90.4,94.4,98.4,102.4,106.4,110.5],42:[86.8,90.9,95,99,103.1,107.2,111.2],43:[87.4,91.5,95.6,99.7,103.8,107.9,112],44:[87.9,92,96.2,100.3,104.5,108.6,112.7],45:[88.4,92.5,96.7,100.9,105.1,109.3,113.5]}
WHO_GIRLS_WFA = {37:[9.7,10.9,12.4,14,16,18.4,21.3],38:[9.8,11.1,12.5,14.2,16.3,18.7,21.6],39:[9.9,11.2,12.7,14.4,16.5,19,22],40:[10.1,11.3,12.8,14.6,16.7,19.2,22.3],41:[10.2,11.5,13,14.8,16.9,19.5,22.7],42:[10.3,11.6,13.1,15,17.2,19.8,23],43:[10.4,11.7,13.3,15.2,17.4,20.1,23.4],44:[10.5,11.8,13.4,15.3,17.6,20.4,23.7],45:[10.6,12,13.6,15.5,17.8,20.7,24.1]}
WHO_BOYS_HFA = {60:[96.1,100.7,105.3,109.9,114.5,119.1,123.7],61:[96.5,101.1,105.7,110.3,114.9,119.4,124],62:[96.9,101.6,106.2,110.8,115.4,120,124.7],63:[97.4,102,106.7,111.3,116,120.6,125.3]}
WHO_BOYS_BMIFA = {60:[12.1,13,14.1,15.3,16.6,18.3,20.2],61:[12.1,13,14.1,15.3,16.6,18.3,20.2],62:[12.1,13,14.1,15.3,16.6,18.3,20.2],63:[12.1,13,14.1,15.3,16.6,18.3,20.2]}


def table_z(value: float, thresholds: list[float]) -> float:
    if value <= thresholds[0]: return -3.0
    for index in range(1, len(thresholds)):
        if value <= thresholds[index]:
            return (index - 4) + (value - thresholds[index-1]) / (thresholds[index] - thresholds[index-1])
    return 3.0


# Reference medians and approximate SDs used to fill monthly ages between WHO
# table points. Use WHO Anthro for clinical z-score interpretation.
GROWTH_REFERENCE = {
    "girls": {
        "height": [(12,74.0,3.0),(24,85.7,3.6),(36,95.1,3.9),(48,102.7,4.2),(60,109.4,4.5)],
        "weight": [(12,8.9,0.9),(24,11.5,1.2),(36,13.9,1.5),(48,16.1,1.8),(60,18.2,2.1)],
    },
    "boys": {
        "height": [(12,75.7,3.0),(24,87.1,3.7),(36,96.1,4.0),(48,103.3,4.3),(60,110.0,4.6)],
        "weight": [(12,9.6,1.0),(24,12.2,1.3),(36,14.3,1.6),(48,16.3,1.9),(60,18.3,2.2)],
    },
}


def interpolate_reference(age: int, sex: str, measure: str) -> tuple[float, float]:
    points = GROWTH_REFERENCE[sex][measure]
    if age <= points[0][0]:
        return points[0][1], points[0][2]
    if age >= points[-1][0]:
        return points[-1][1], points[-1][2]
    for left, right in zip(points, points[1:]):
        if left[0] <= age <= right[0]:
            ratio = (age - left[0]) / (right[0] - left[0])
            return left[1] + ratio * (right[1] - left[1]), left[2] + ratio * (right[2] - left[2])
    return points[-1][1], points[-1][2]


def build_growth_assessment(child: models.Child, record: models.GrowthRecord) -> tuple[str, str, list[dict]]:
    age = age_in_months(child.date_of_birth, record.recorded_at)
    female = child.gender.lower() in ("perempuan", "female", "f")
    sex = "girls" if female else "boys"
    indicators = []
    if age < 60:
        exact_hfa = WHO_GIRLS_HFA.get(age) if female else None
        exact_wfa = WHO_GIRLS_WFA.get(age) if female else None
        if exact_hfa:
            hfa_z = table_z(float(record.height_cm), exact_hfa)
        else:
            median, sd = interpolate_reference(age, sex, "height")
            hfa_z = (float(record.height_cm) - median) / sd
        hfa_status = "Normal" if hfa_z >= -2 else "Perlu Perhatian"
        indicators.append({"indicator_type":"Tinggi menurut usia", "status":hfa_status, "value":hfa_z, "unit":"z-score", "interpretation":f"Z-score perkiraan {hfa_z:.1f}; acuan umur {age} bulan."})
        if exact_wfa:
            wfa_z = table_z(float(record.weight_kg), exact_wfa)
        else:
            median, sd = interpolate_reference(age, sex, "weight")
            wfa_z = (float(record.weight_kg) - median) / sd
        wfa_status = "Normal" if wfa_z >= -2 else "Perlu Perhatian"
        indicators.append({"indicator_type":"Berat menurut usia", "status":wfa_status, "value":wfa_z, "unit":"z-score", "interpretation":f"Z-score perkiraan {wfa_z:.1f}; acuan umur {age} bulan."})
    else:
        hfa = WHO_BOYS_HFA.get(age) if not female else None
        bmifa = WHO_BOYS_BMIFA.get(age) if not female else None
        if hfa:
            z = table_z(float(record.height_cm), hfa)
            indicators.append({"indicator_type":"Tinggi menurut usia", "status":"Normal" if z >= -2 else "Perlu Perhatian", "value":z, "unit":"z-score", "interpretation":f"Z-score perkiraan {z:.1f}; rujukan tinggi menurut usia WHO 5-19 tahun."})
        if bmifa:
            bmi = float(record.weight_kg) / ((float(record.height_cm)/100) ** 2)
            z = table_z(bmi, bmifa)
            indicators.append({"indicator_type":"BMI menurut usia", "status":"Normal" if -2 <= z <= 1 else "Perlu Perhatian", "value":z, "unit":"z-score", "interpretation":f"BMI {bmi:.1f} kg/m2; z-score perkiraan {z:.1f} (rujukan WHO 5-19 tahun)."})
    status = "Perlu Perhatian" if any(i["status"] != "Normal" for i in indicators) else "Normal"
    summary = "; ".join(f"{i['indicator_type']}: {i['status']}" for i in indicators) or "Umur pengukuran di luar rentang tabel; penilaian otomatis tidak tersedia."
    return status, summary, indicators


def store_assessment(db: Session, child: models.Child, record: models.GrowthRecord) -> None:
    status_value, summary, indicators = build_growth_assessment(child, record)
    previous = db.scalar(select(models.GrowthAssessment).options(selectinload(models.GrowthAssessment.indicators)).where(models.GrowthAssessment.child_id == child.id, models.GrowthAssessment.assessed_at == record.recorded_at))
    if previous:
        previous.status, previous.summary = status_value, summary
        previous.indicators.clear()
        # Delete old indicator rows before re-inserting rows with the same
        # (assessment_id, indicator_type) unique key.
        db.flush()
        target = previous
    else:
        target = models.GrowthAssessment(child_id=child.id, assessed_at=record.recorded_at, status=status_value, summary=summary,
            disclaimer="Data contoh buatan. Z-score adalah perkiraan dari median dan simpangan baku acuan WHO yang diinterpolasi; perhitungan ini bukan WHO Anthro atau diagnosis. Konfirmasi pengukuran dan penilaian dengan tenaga kesehatan.")
        db.add(target)
    target.indicators.extend(models.GrowthAssessmentIndicator(**item) for item in indicators)


@app.get("/api/children/{child_id}/growth-assessments")
def list_growth_assessments(child_id: int, db: Session = Depends(get_db)) -> list[dict]:
    require_child(db, child_id)
    rows = db.scalars(select(models.GrowthAssessment).options(selectinload(models.GrowthAssessment.indicators)).where(models.GrowthAssessment.child_id == child_id).order_by(models.GrowthAssessment.assessed_at.desc())).all()
    return [assessment_output(row) for row in rows]


@app.get("/api/caregivers")
def list_caregivers(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(models.Caregiver).options(selectinload(models.Caregiver.children)).where(models.Caregiver.is_active.is_(True)).order_by(models.Caregiver.name)).all()
    return [{"id": row.id, "name": row.name, "active": row.is_active,
        "address": row.address, "phone": row.phone,
        "childCount": len(row.children), "children": [{"id": child.id, "name": child.name, "code": child.code} for child in row.children]}
        for row in rows if row.children]


@app.patch("/api/caregivers/{caregiver_id}")
def update_caregiver(caregiver_id: int, payload: CaregiverUpdate, db: Session = Depends(get_db)) -> dict:
    caregiver = db.get(models.Caregiver, caregiver_id)
    if caregiver is None:
        raise HTTPException(status_code=404, detail="Pengasuh tidak ditemukan")
    caregiver.address = payload.address.strip() if payload.address else None
    caregiver.phone = payload.phone.strip() if payload.phone else None
    db.commit()
    return {"id": caregiver.id, "name": caregiver.name, "address": caregiver.address, "phone": caregiver.phone}


@app.get("/api/healthz")
def healthz(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.get("/api/children")
def list_children(
    offset: int = 0,
    limit: int | None = None,
    db: Session = Depends(get_db),
) -> list[dict] | dict:
    query = select(models.Child).options(selectinload(models.Child.caregiver), selectinload(models.Child.allergies), selectinload(models.Child.special_conditions)).order_by(models.Child.id)
    if limit is not None:
        limit = max(1, min(limit, 100))
        total = db.scalar(select(func.count()).select_from(models.Child)) or 0
        children = db.scalars(query.offset(max(0, offset)).limit(limit)).all()
        return {"items": [child_output(child) for child in children], "total": total}
    children = db.scalars(query).all()
    return [child_output(child) for child in children]


@app.post("/api/children", status_code=status.HTTP_201_CREATED)
def create_child(payload: ChildCreate, db: Session = Depends(get_db)) -> dict:
    caregiver = None
    if payload.caregiver:
        caregiver = db.scalar(select(models.Caregiver).where(models.Caregiver.name == payload.caregiver))
        if caregiver is None:
            caregiver = models.Caregiver(name=payload.caregiver)
            db.add(caregiver)
            db.flush()
    child = models.Child(code=payload.code, name=payload.name, nickname=payload.nickname,
        date_of_birth=payload.date_of_birth, gender=payload.gender, entry_date=payload.entry_date,
        health_status=payload.health, condition=payload.condition, caregiver=caregiver, background=payload.background)
    child.allergies = [models.ChildAllergy(description=value) for value in payload.allergies]
    child.special_conditions = [models.ChildSpecialCondition(description=value) for value in payload.special_conditions]
    db.add(child)
    db.commit()
    db.refresh(child)
    return child_output(child)


@app.get("/api/children/{child_id}")
def get_child(child_id: int, db: Session = Depends(get_db)) -> dict:
    child = db.scalar(select(models.Child).options(selectinload(models.Child.caregiver), selectinload(models.Child.allergies), selectinload(models.Child.special_conditions)).where(models.Child.id == child_id))
    if child is None:
        raise HTTPException(status_code=404, detail="Anak tidak ditemukan")
    return child_output(child)


@app.put("/api/children/{child_id}")
def update_child(child_id: int, payload: ChildCreate, db: Session = Depends(get_db)) -> dict:
    child = db.scalar(select(models.Child).options(selectinload(models.Child.caregiver), selectinload(models.Child.allergies), selectinload(models.Child.special_conditions)).where(models.Child.id == child_id))
    if child is None:
        raise HTTPException(status_code=404, detail="Anak tidak ditemukan")
    caregiver = None
    if payload.caregiver:
        caregiver = db.scalar(select(models.Caregiver).where(models.Caregiver.name == payload.caregiver))
        if caregiver is None:
            caregiver = models.Caregiver(name=payload.caregiver)
            db.add(caregiver)
            db.flush()
    child.code = payload.code
    child.name = payload.name
    child.nickname = payload.nickname
    child.date_of_birth = payload.date_of_birth
    child.gender = payload.gender
    child.entry_date = payload.entry_date
    child.health_status = payload.health
    child.condition = payload.condition
    child.caregiver = caregiver
    child.background = payload.background
    # Flush orphan deletions first so unchanged unique child-value pairs can
    # be re-created without violating the per-child uniqueness constraints.
    child.allergies.clear()
    child.special_conditions.clear()
    db.flush()
    child.allergies = [models.ChildAllergy(description=value) for value in payload.allergies]
    child.special_conditions = [models.ChildSpecialCondition(description=value) for value in payload.special_conditions]
    db.commit()
    db.refresh(child)
    return child_output(child)


@app.delete("/api/children/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(child_id: int, db: Session = Depends(get_db)) -> Response:
    child = require_child(db, child_id)
    db.delete(child)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/children/{child_id}/health-records")
def list_health_records(child_id: int, db: Session = Depends(get_db)) -> list[dict]:
    require_child(db, child_id)
    records = db.scalars(select(models.HealthRecord).where(models.HealthRecord.child_id == child_id).order_by(models.HealthRecord.recorded_at.desc(), models.HealthRecord.id.desc())).all()
    return [{"id": r.id, "childId": r.child_id, "recordedAt": r.recorded_at.isoformat(), "status": r.status, "title": r.title, "summary": r.summary, "notes": r.notes, "recordedBy": r.recorded_by} for r in records]


@app.post("/api/children/{child_id}/health-records", status_code=status.HTTP_201_CREATED)
def create_health_record(child_id: int, payload: HealthRecordCreate, db: Session = Depends(get_db)) -> dict:
    child = require_child(db, child_id)
    record = models.HealthRecord(child_id=child.id, recorded_at=payload.recorded_at, status=payload.status, title=payload.title, summary=payload.summary, notes=payload.notes, recorded_by=payload.recorded_by)
    db.add(record)
    child.health_status = payload.status
    db.commit()
    db.refresh(record)
    return {"id": record.id, "childId": record.child_id, "recordedAt": record.recorded_at.isoformat(), "status": record.status, "title": record.title, "summary": record.summary, "notes": record.notes, "recordedBy": record.recorded_by}


@app.put("/api/health-records/{record_id}")
def update_health_record(record_id: int, payload: HealthRecordCreate, db: Session = Depends(get_db)) -> dict:
    record = db.get(models.HealthRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Catatan kesehatan tidak ditemukan")
    record.recorded_at = payload.recorded_at
    record.status = payload.status
    record.title = payload.title
    record.summary = payload.summary
    record.notes = payload.notes
    record.recorded_by = payload.recorded_by
    child = require_child(db, record.child_id)
    child.health_status = payload.status
    db.commit()
    db.refresh(record)
    return {"id": record.id, "childId": record.child_id, "recordedAt": record.recorded_at.isoformat(), "status": record.status, "title": record.title, "summary": record.summary, "notes": record.notes, "recordedBy": record.recorded_by}


@app.delete("/api/health-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_record(record_id: int, db: Session = Depends(get_db)) -> Response:
    record = db.get(models.HealthRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Catatan kesehatan tidak ditemukan")
    child_id = record.child_id
    db.delete(record)
    db.flush()
    latest = db.scalar(select(models.HealthRecord).where(models.HealthRecord.child_id == child_id).order_by(models.HealthRecord.recorded_at.desc(), models.HealthRecord.id.desc()))
    require_child(db, child_id).health_status = latest.status if latest else "Normal"
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/children/{child_id}/growth-records")
def list_growth_records(child_id: int, db: Session = Depends(get_db)) -> list[dict]:
    require_child(db, child_id)
    records = db.scalars(select(models.GrowthRecord).where(models.GrowthRecord.child_id == child_id).order_by(models.GrowthRecord.recorded_at.desc())).all()
    return [{"id": r.id, "childId": r.child_id, "recordedAt": r.recorded_at.isoformat(), "weight": float(r.weight_kg), "height": float(r.height_cm), "notes": r.notes, "recordedBy": r.recorded_by} for r in records]


@app.post("/api/children/{child_id}/growth-records", status_code=status.HTTP_201_CREATED)
def create_growth_record(child_id: int, payload: GrowthRecordCreate, db: Session = Depends(get_db)) -> dict:
    child = require_child(db, child_id)
    record = models.GrowthRecord(child_id=child_id, recorded_at=payload.recorded_at, weight_kg=payload.weight, height_cm=payload.height, notes=payload.notes, recorded_by=payload.recorded_by)
    db.add(record)
    db.flush()
    store_assessment(db, child, record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "childId": child_id, "recordedAt": record.recorded_at.isoformat(), "weight": float(record.weight_kg), "height": float(record.height_cm), "notes": record.notes, "recordedBy": record.recorded_by}


@app.put("/api/growth-records/{record_id}")
def update_growth_record(record_id: int, payload: GrowthRecordCreate, db: Session = Depends(get_db)) -> dict:
    record = db.get(models.GrowthRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Catatan pertumbuhan tidak ditemukan")
    record.recorded_at = payload.recorded_at
    record.weight_kg = payload.weight
    record.height_cm = payload.height
    record.notes = payload.notes
    record.recorded_by = payload.recorded_by
    store_assessment(db, require_child(db, record.child_id), record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "childId": record.child_id, "recordedAt": record.recorded_at.isoformat(), "weight": float(record.weight_kg), "height": float(record.height_cm), "notes": record.notes, "recordedBy": record.recorded_by}


@app.delete("/api/growth-records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_growth_record(record_id: int, db: Session = Depends(get_db)) -> Response:
    record = db.get(models.GrowthRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Catatan pertumbuhan tidak ditemukan")
    assessment = db.scalar(select(models.GrowthAssessment).where(models.GrowthAssessment.child_id == record.child_id, models.GrowthAssessment.assessed_at == record.recorded_at))
    if assessment:
        db.delete(assessment)
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/children/{child_id}/daily-notes")
def list_daily_notes(child_id: int, db: Session = Depends(get_db)) -> list[dict]:
    require_child(db, child_id)
    rows = db.scalars(select(models.DailyNote).where(models.DailyNote.child_id == child_id).order_by(models.DailyNote.recorded_at.desc())).all()
    return [{"id": r.id, "childId": r.child_id, "recordedAt": r.recorded_at.isoformat(), "category": r.category, "title": r.title, "content": r.content, "recordedBy": r.recorded_by} for r in rows]


@app.post("/api/children/{child_id}/daily-notes", status_code=status.HTTP_201_CREATED)
def create_daily_note(child_id: int, payload: DailyNoteCreate, db: Session = Depends(get_db)) -> dict:
    require_child(db, child_id)
    row = models.DailyNote(child_id=child_id, recorded_at=payload.recorded_at, category=payload.category, title=payload.title, content=payload.content, recorded_by=payload.recorded_by)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "childId": row.child_id, "recordedAt": row.recorded_at.isoformat(), "category": row.category, "title": row.title, "content": row.content, "recordedBy": row.recorded_by}


@app.put("/api/daily-notes/{note_id}")
def update_daily_note(note_id: int, payload: DailyNoteCreate, db: Session = Depends(get_db)) -> dict:
    row = db.get(models.DailyNote, note_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Catatan harian tidak ditemukan")
    row.recorded_at = payload.recorded_at
    row.category = payload.category
    row.title = payload.title
    row.content = payload.content
    row.recorded_by = payload.recorded_by
    db.commit()
    db.refresh(row)
    return {"id": row.id, "childId": row.child_id, "recordedAt": row.recorded_at.isoformat(), "category": row.category, "title": row.title, "content": row.content, "recordedBy": row.recorded_by}


@app.delete("/api/daily-notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_daily_note(note_id: int, db: Session = Depends(get_db)) -> Response:
    row = db.get(models.DailyNote, note_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Catatan harian tidak ditemukan")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def reminder_output(row: models.Reminder) -> dict:
    return {"id": row.id, "childId": row.child_id, "title": row.title, "description": row.description, "type": row.type, "dueDate": row.due_date.isoformat(), "dueTime": row.due_time.isoformat(timespec="minutes") if row.due_time else None, "repeat": row.repeat_rule, "completed": row.completed, "createdAt": row.created_at.date().isoformat()}


@app.get("/api/reminders")
def list_reminders(child_id: int | None = Query(default=None, alias="childId"), db: Session = Depends(get_db)) -> list[dict]:
    query = select(models.Reminder).order_by(models.Reminder.due_date, models.Reminder.due_time)
    if child_id is not None:
        query = query.where(models.Reminder.child_id == child_id)
    return [reminder_output(row) for row in db.scalars(query).all()]


@app.post("/api/reminders", status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate, db: Session = Depends(get_db)) -> dict:
    row = models.Reminder(child_id=payload.child_id, title=payload.title, description=payload.description, type=payload.type, due_date=payload.due_date, due_time=payload.due_time, repeat_rule=payload.repeat, completed=payload.completed)
    db.add(row)
    db.commit()
    db.refresh(row)
    return reminder_output(row)


@app.patch("/api/reminders/{reminder_id}")
def update_reminder(reminder_id: int, payload: ReminderUpdate, db: Session = Depends(get_db)) -> dict:
    row = db.get(models.Reminder, reminder_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Pengingat tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, {"repeat": "repeat_rule"}.get(key, key), value)
    db.commit()
    db.refresh(row)
    return reminder_output(row)


@app.delete("/api/reminders/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)) -> Response:
    row = db.get(models.Reminder, reminder_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Pengingat tidak ditemukan")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def need_item_output(row: models.NeedItem) -> dict:
    return {"id": row.code, "name": row.name, "group": row.category, "section": row.section, "detail": row.detail,
        "quantity": row.quantity, "unit": row.unit, "gender": row.gender, "size": row.size, "color": row.color}


@app.get("/api/needs")
def list_need_items(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.scalars(select(models.NeedItem).order_by(models.NeedItem.category, models.NeedItem.name, models.NeedItem.gender, models.NeedItem.size)).all()
    return [need_item_output(row) for row in rows]


@app.post("/api/needs/initialize")
def initialize_need_items(payload: list[NeedItemCreate], db: Session = Depends(get_db)) -> dict:
    """Seed an empty inventory or update category labels without resetting stock."""
    existing = set(db.scalars(select(models.NeedItem.code)).all())
    for item in payload:
        if not existing:
            db.add(models.NeedItem(code=item.id, name=item.name, category=item.group, detail=item.detail,
                section=item.section, quantity=item.quantity, unit=item.unit, gender=item.gender, size=item.size, color=item.color))
        else:
            row = db.scalar(select(models.NeedItem).where(models.NeedItem.code == item.id))
            if row and item.section:
                row.section = item.section
    db.commit()
    return {"status": "initialized"}


@app.post("/api/needs", status_code=status.HTTP_201_CREATED)
def create_need_item(payload: NeedItemCreate, db: Session = Depends(get_db)) -> dict:
    row = db.scalar(select(models.NeedItem).where(models.NeedItem.code == payload.id))
    if row is None:
        duplicate = db.scalar(select(models.NeedItem).where(func.lower(func.trim(models.NeedItem.name)) == payload.name.strip().lower()))
        if duplicate:
            raise HTTPException(status_code=409, detail=f"Kebutuhan sudah ada: {duplicate.name}")
        row = models.NeedItem(code=payload.id, name=payload.name, category=payload.group, section=payload.section, detail=payload.detail,
            quantity=payload.quantity, unit=payload.unit, gender=payload.gender, size=payload.size, color=payload.color)
        db.add(row)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Kebutuhan sudah ada")
        db.refresh(row)
    return need_item_output(row)


@app.patch("/api/needs/{item_code}")
def update_need_item(item_code: str, payload: NeedItemUpdate, db: Session = Depends(get_db)) -> dict:
    row = db.scalar(select(models.NeedItem).where(models.NeedItem.code == item_code))
    if row is None:
        raise HTTPException(status_code=404, detail="Kebutuhan tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return need_item_output(row)


@app.delete("/api/needs/{item_code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_need_item(item_code: str, db: Session = Depends(get_db)) -> Response:
    row = db.scalar(select(models.NeedItem).where(models.NeedItem.code == item_code))
    if row is None:
        raise HTTPException(status_code=404, detail="Kebutuhan tidak ditemukan")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
