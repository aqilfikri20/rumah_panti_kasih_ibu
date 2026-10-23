export type GrowthAssessmentStatus =
  | "Normal"
  | "Perlu Perhatian";

export type GrowthIndicatorType =
  | "Berat menurut usia"
  | "Tinggi menurut usia"
  | "Berat menurut tinggi"
  | "BMI menurut usia";

export interface GrowthIndicator {
  type: GrowthIndicatorType;
  status: GrowthAssessmentStatus;
  value: number;
  unit: string;
  interpretation: string;
}

export interface GrowthAssessment {
  status: GrowthAssessmentStatus;
  assessedAt: string;
  indicators: GrowthIndicator[];
  summary: string;
  disclaimer: string;
}
