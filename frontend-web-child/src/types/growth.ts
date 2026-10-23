export interface GrowthRecord {
  id: number;
  childId: number;
  recordedAt: string;

  weight: number;
  height: number;

  notes?: string;

  recordedBy: string;
}

export interface GrowthInfo {
  history: GrowthRecord[];
}