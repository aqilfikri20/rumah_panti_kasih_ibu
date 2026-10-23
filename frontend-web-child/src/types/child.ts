export type ChildHealthStatus =
  | "Normal"
  | "Perlu Perhatian"
  | "Penting";

export type ChildCondition =
  | "Normal"
  | "Disabilitas";

export interface Child {
  id: number;
  code: string;
  name: string;
  nickname?: string;
  dateOfBirth: string;
  gender: "Laki-laki" | "Perempuan";
  entryDate: string;
  health: ChildHealthStatus;
  condition: ChildCondition;
  caregiver: string;

  background?: string;

  allergies?: string[];
  specialConditions?: string[];
}
