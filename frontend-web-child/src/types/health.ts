export type HealthStatus =
  | "Normal"
  | "Perlu Perhatian"
  | "Penting";

export interface HealthRecord {
  id: number;
  childId: number;
  recordedAt: string;
  status: HealthStatus;
  title: string;
  summary: string;
  notes?: string;
  recordedBy: string;
}

export interface HealthInfo {
  status: HealthStatus;
  allergies: string[];
  specialConditions: string[];
  lastCheckup?: HealthRecord;
  history: HealthRecord[];
}
