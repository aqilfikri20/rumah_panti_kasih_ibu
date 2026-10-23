export type DailyNoteCategory =
  | "Aktivitas"
  | "Makan"
  | "Tidur"
  | "Perilaku"
  | "Kesehatan"
  | "Lainnya";

export interface DailyNote {
  id: number;
  childId: number;
  recordedAt: string;

  category: DailyNoteCategory;
  title: string;
  content: string;

  recordedBy: string;
}