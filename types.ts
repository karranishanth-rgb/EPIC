
export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  address: string;
}

export interface Encounter {
  id: string;
  date: string;
  type: string;
  practitioner: string;
}

export interface Condition {
  id: string;
  code: string;
  description: string;
}

export interface Procedure {
  id: string;
  code: string;
  description: string;
}

export interface PatientData {
  encounters: Encounter[];
  conditions: Condition[];
  procedures: Procedure[];
}

export interface Claim {
  patientId: string;
  encounterId: string;
  diagnoses: Condition[];
  procedures: Procedure[];
  clinicalJustification: string;
}
