import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "./api";
import type { Child } from "../types/child";
import type { HealthInfo, HealthRecord } from "../types/health";
import type { GrowthInfo, GrowthRecord } from "../types/growth";
import type { DailyNote } from "../types/dailyNote";
import type { Reminder } from "../types/reminder";
import type { GrowthAssessment } from "../types/growthAssessment";

export interface CaregiverSummary {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  childCount: number;
  children: { id: number; name: string; code: string }[];
}

interface AppData {
  children: Child[];
  caregivers: CaregiverSummary[];
  reminders: Reminder[];
  dailyNotes: DailyNote[];
  healthData: Record<number, HealthInfo>;
  growthData: Record<number, GrowthInfo>;
  growthAssessmentData: Record<number, GrowthAssessment>;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  createChild: (child: Child) => Promise<void>;
  createReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  updateChild: (child: Child) => Promise<void>;
  updateCaregiver: (id: number, contact: { address: string; phone: string }) => Promise<void>;
  createHealthRecord: (childId: number, record: HealthRecord) => Promise<void>;
  updateHealthRecord: (record: HealthRecord) => Promise<void>;
  deleteHealthRecord: (id: number) => Promise<void>;
  createGrowthRecord: (childId: number, record: GrowthRecord) => Promise<void>;
  updateGrowthRecord: (record: GrowthRecord) => Promise<void>;
  deleteGrowthRecord: (id: number) => Promise<void>;
  createDailyNote: (childId: number, note: DailyNote) => Promise<void>;
  updateDailyNote: (note: DailyNote) => Promise<void>;
  deleteDailyNote: (id: number) => Promise<void>;
}

const DataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children: page }: { children: ReactNode }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [caregivers, setCaregivers] = useState<CaregiverSummary[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [healthData, setHealthData] = useState<Record<number, HealthInfo>>({});
  const [growthData, setGrowthData] = useState<Record<number, GrowthInfo>>({});
  const [growthAssessmentData, setGrowthAssessmentData] = useState<Record<number, GrowthAssessment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [childRows, reminderRows, caregiverRows] = await Promise.all([
        api.get<Child[]>("/children"),
        api.get<Reminder[]>("/reminders"),
        api.get<CaregiverSummary[]>("/caregivers"),
      ]);
      const details = await Promise.all(childRows.map(async (child) => {
        const [health, growth, notes, assessments] = await Promise.all([
          api.get<HealthRecord[]>(`/children/${child.id}/health-records`),
          api.get<GrowthRecord[]>(`/children/${child.id}/growth-records`),
          api.get<DailyNote[]>(`/children/${child.id}/daily-notes`),
          api.get<GrowthAssessment[]>(`/children/${child.id}/growth-assessments`),
        ]);
        return { child, health, growth, notes, assessments };
      }));
      const nextHealth: Record<number, HealthInfo> = {};
      const nextGrowth: Record<number, GrowthInfo> = {};
      const nextNotes: DailyNote[] = [];
      const nextAssessments: Record<number, GrowthAssessment> = {};
      details.forEach(({ child, health, growth, notes, assessments }) => {
        nextHealth[child.id] = {
          status: child.health,
          allergies: child.allergies ?? [],
          specialConditions: child.specialConditions ?? [],
          lastCheckup: health[0],
          history: health,
        };
        nextGrowth[child.id] = { history: growth };
        if (assessments[0]) nextAssessments[child.id] = assessments[0];
        nextNotes.push(...notes);
      });
      setChildren(childRows);
      setCaregivers(caregiverRows);
      setReminders(reminderRows);
      setHealthData(nextHealth);
      setGrowthData(nextGrowth);
      setGrowthAssessmentData(nextAssessments);
      setDailyNotes(nextNotes);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Tidak dapat terhubung ke backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const actions = useMemo<AppData>(() => ({
    children, caregivers, reminders, dailyNotes, healthData, growthData, growthAssessmentData, loading, error, refresh,
    async createChild(child) {
      await api.post<Child>("/children", {
        code: child.code, name: child.name, nickname: child.nickname,
        dateOfBirth: child.dateOfBirth, gender: child.gender, entryDate: child.entryDate,
        health: child.health, condition: child.condition, caregiver: child.caregiver,
        background: child.background, allergies: child.allergies ?? [],
        specialConditions: child.specialConditions ?? [],
      });
      await refresh();
    },
    async updateChild(child) {
      await api.put(`/children/${child.id}`, {
        code: child.code, name: child.name, nickname: child.nickname,
        dateOfBirth: child.dateOfBirth, gender: child.gender, entryDate: child.entryDate,
        health: child.health, condition: child.condition, caregiver: child.caregiver,
        background: child.background, allergies: child.allergies ?? [],
        specialConditions: child.specialConditions ?? [],
      });
      await refresh();
    },
    async updateCaregiver(id, contact) {
      await api.patch(`/caregivers/${id}`, contact);
      await refresh();
    },
    async createReminder(reminder) {
      await api.post<Reminder>("/reminders", {
        childId: reminder.childId ?? null, title: reminder.title,
        description: reminder.description, type: reminder.type, dueDate: reminder.dueDate,
        dueTime: reminder.dueTime ?? null, repeat: reminder.repeat,
      });
      await refresh();
    },
    async updateReminder(reminder) {
      await api.patch<Reminder>(`/reminders/${reminder.id}`, {
        childId: reminder.childId ?? null, title: reminder.title,
        description: reminder.description, type: reminder.type, dueDate: reminder.dueDate,
        dueTime: reminder.dueTime ?? null, repeat: reminder.repeat, completed: reminder.completed,
      });
      await refresh();
    },
    async deleteReminder(id) { await api.delete(`/reminders/${id}`); await refresh(); },
    async createHealthRecord(childId, record) {
      await api.post(`/children/${childId}/health-records`, {
        recordedAt: record.recordedAt, status: record.status, title: record.title,
        summary: record.summary, notes: record.notes, recordedBy: record.recordedBy,
      });
      await refresh();
    },
    async updateHealthRecord(record) {
      await api.put(`/health-records/${record.id}`, {
        recordedAt: record.recordedAt, status: record.status, title: record.title,
        summary: record.summary, notes: record.notes, recordedBy: record.recordedBy,
      });
      await refresh();
    },
    async deleteHealthRecord(id) { await api.delete(`/health-records/${id}`); await refresh(); },
    async createGrowthRecord(childId, record) {
      await api.post(`/children/${childId}/growth-records`, {
        recordedAt: record.recordedAt, weight: record.weight, height: record.height,
        notes: record.notes, recordedBy: record.recordedBy,
      });
      await refresh();
    },
    async updateGrowthRecord(record) {
      await api.put(`/growth-records/${record.id}`, {
        recordedAt: record.recordedAt, weight: record.weight, height: record.height,
        notes: record.notes, recordedBy: record.recordedBy,
      });
      await refresh();
    },
    async deleteGrowthRecord(id) { await api.delete(`/growth-records/${id}`); await refresh(); },
    async createDailyNote(childId, note) {
      await api.post(`/children/${childId}/daily-notes`, {
        recordedAt: note.recordedAt, category: note.category, title: note.title,
        content: note.content, recordedBy: note.recordedBy,
      });
      await refresh();
    },
    async updateDailyNote(note) {
      await api.put(`/daily-notes/${note.id}`, {
        recordedAt: note.recordedAt, category: note.category, title: note.title,
        content: note.content, recordedBy: note.recordedBy,
      });
      await refresh();
    },
    async deleteDailyNote(id) { await api.delete(`/daily-notes/${id}`); await refresh(); },
  }), [children, caregivers, reminders, dailyNotes, healthData, growthData, growthAssessmentData, loading, error, refresh]);

  return <DataContext.Provider value={actions}>
    {error && <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg">Backend: {error}</div>}
    {page}
  </DataContext.Provider>;
}

export function useAppData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
}

