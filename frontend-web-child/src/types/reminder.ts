export type ReminderType =
  | "Penting"
  | "Rutin";

export type ReminderRepeat =
  | "Tidak berulang"
  | "Setiap hari"
  | "Setiap minggu"
  | "Setiap bulan";

export interface Reminder {
  id: number;
  childId?: number;

  title: string;
  description?: string;

  type: ReminderType;

  dueDate: string;
  dueTime?: string;

  repeat: ReminderRepeat;

  completed: boolean;

  createdAt: string;
}