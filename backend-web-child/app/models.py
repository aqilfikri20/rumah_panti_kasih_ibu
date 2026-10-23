from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Identity, Numeric, Text, Time, UniqueConstraint, BigInteger, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Caregiver(Base):
    __tablename__ = "caregivers"
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    children: Mapped[list["Child"]] = relationship(back_populates="caregiver")


class Child(Base):
    __tablename__ = "children"
    __table_args__ = (CheckConstraint("entry_date >= date_of_birth"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    nickname: Mapped[str | None] = mapped_column(Text)
    date_of_birth: Mapped[object] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(Text, nullable=False)
    entry_date: Mapped[object] = mapped_column(Date, nullable=False)
    health_status: Mapped[str] = mapped_column(Text, nullable=False, default="Normal")
    condition: Mapped[str] = mapped_column(Text, nullable=False, default="Normal")
    caregiver_id: Mapped[int | None] = mapped_column(ForeignKey("caregivers.id", ondelete="SET NULL"))
    background: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    caregiver: Mapped[Caregiver | None] = relationship(back_populates="children")
    allergies: Mapped[list["ChildAllergy"]] = relationship(cascade="all, delete-orphan")
    special_conditions: Mapped[list["ChildSpecialCondition"]] = relationship(cascade="all, delete-orphan")
    health_records: Mapped[list["HealthRecord"]] = relationship(cascade="all, delete-orphan")
    growth_records: Mapped[list["GrowthRecord"]] = relationship(cascade="all, delete-orphan")
    daily_notes: Mapped[list["DailyNote"]] = relationship(cascade="all, delete-orphan")


class ChildAllergy(Base):
    __tablename__ = "child_allergies"
    __table_args__ = (UniqueConstraint("child_id", "description"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class ChildSpecialCondition(Base):
    __tablename__ = "child_special_conditions"
    __table_args__ = (UniqueConstraint("child_id", "description"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class HealthRecord(Base):
    __tablename__ = "health_records"
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    recorded_at: Mapped[object] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    recorded_by: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class GrowthRecord(Base):
    __tablename__ = "growth_records"
    __table_args__ = (UniqueConstraint("child_id", "recorded_at"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    recorded_at: Mapped[object] = mapped_column(Date, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    height_cm: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
    recorded_by: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class GrowthAssessment(Base):
    __tablename__ = "growth_assessments"
    __table_args__ = (UniqueConstraint("child_id", "assessed_at"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    assessed_at: Mapped[object] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    disclaimer: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    indicators: Mapped[list["GrowthAssessmentIndicator"]] = relationship(cascade="all, delete-orphan")


class GrowthAssessmentIndicator(Base):
    __tablename__ = "growth_assessment_indicators"
    __table_args__ = (UniqueConstraint("assessment_id", "indicator_type"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("growth_assessments.id", ondelete="CASCADE"))
    indicator_type: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False)
    value: Mapped[float] = mapped_column(Numeric(7, 2), nullable=False)
    unit: Mapped[str] = mapped_column(Text, nullable=False)
    interpretation: Mapped[str] = mapped_column(Text, nullable=False)


class DailyNote(Base):
    __tablename__ = "daily_notes"
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    recorded_at: Mapped[object] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    recorded_by: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    child_id: Mapped[int | None] = mapped_column(ForeignKey("children.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(Text, nullable=False)
    due_date: Mapped[object] = mapped_column(Date, nullable=False)
    due_time: Mapped[object | None] = mapped_column(Time)
    repeat_rule: Mapped[str] = mapped_column(Text, nullable=False, default="Tidak berulang")
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class NeedItem(Base):
    __tablename__ = "need_items"
    __table_args__ = (CheckConstraint("quantity >= 0"),)
    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    section: Mapped[str | None] = mapped_column(Text)
    detail: Mapped[str | None] = mapped_column(Text)
    quantity: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    unit: Mapped[str | None] = mapped_column(Text)
    gender: Mapped[str | None] = mapped_column(Text)
    size: Mapped[str | None] = mapped_column(Text)
    color: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

