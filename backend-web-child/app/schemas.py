from datetime import date, time
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class ChildCreate(APIModel):
    code: str
    name: str
    nickname: str | None = None
    date_of_birth: date = Field(alias="dateOfBirth")
    gender: str
    entry_date: date = Field(alias="entryDate")
    health: str = "Normal"
    condition: str = "Normal"
    caregiver: str | None = None
    background: str | None = None
    allergies: list[str] = []
    special_conditions: list[str] = Field(default_factory=list, alias="specialConditions")


class CaregiverUpdate(APIModel):
    address: str | None = None
    phone: str | None = None


class HealthRecordCreate(APIModel):
    recorded_at: date = Field(alias="recordedAt")
    status: str
    title: str
    summary: str
    notes: str | None = None
    recorded_by: str = Field(alias="recordedBy")


class GrowthRecordCreate(APIModel):
    recorded_at: date = Field(alias="recordedAt")
    weight: Decimal
    height: Decimal
    notes: str | None = None
    recorded_by: str = Field(alias="recordedBy")


class DailyNoteCreate(APIModel):
    recorded_at: date = Field(alias="recordedAt")
    category: str
    title: str
    content: str
    recorded_by: str = Field(alias="recordedBy")


class ReminderCreate(APIModel):
    child_id: int | None = Field(default=None, alias="childId")
    title: str
    description: str | None = None
    type: str
    due_date: date = Field(alias="dueDate")
    due_time: time | None = Field(default=None, alias="dueTime")
    repeat: str = "Tidak berulang"
    completed: bool = False


class ReminderUpdate(APIModel):
    child_id: int | None = Field(default=None, alias="childId")
    title: str | None = None
    description: str | None = None
    type: str | None = None
    due_date: date | None = Field(default=None, alias="dueDate")
    due_time: time | None = Field(default=None, alias="dueTime")
    repeat: str | None = None
    completed: bool | None = None


class NeedItemCreate(APIModel):
    id: str
    name: str
    group: str
    section: str | None = None
    detail: str | None = None
    quantity: int = Field(ge=0)
    unit: str | None = None
    gender: str | None = None
    size: str | None = None
    color: str | None = None


class NeedItemUpdate(APIModel):
    quantity: int | None = Field(default=None, ge=0)
    gender: str | None = None
    size: str | None = None
    color: str | None = None
