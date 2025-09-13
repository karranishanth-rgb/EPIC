
import type { Patient, PatientData } from '../types';

const mockPatient: Patient = {
  id: '12345',
  name: 'John Appleseed',
  birthDate: '1985-04-12',
  gender: 'male',
  address: '123 Main St, Anytown, USA',
};

const mockPatientData: PatientData = {
  encounters: [
    { id: 'enc1', date: '2023-10-26', type: 'Office Visit', practitioner: 'Dr. Emily Carter' },
    { id: 'enc2', date: '2023-08-15', type: 'Follow-up', practitioner: 'Dr. Emily Carter' },
  ],
  conditions: [
    { id: 'cond1', code: 'J02.9', description: 'Acute pharyngitis, unspecified' },
    { id: 'cond2', code: 'R05', description: 'Cough' },
    { id: 'cond3', code: 'I10', description: 'Essential (primary) hypertension' },
  ],
  procedures: [
    { id: 'proc1', code: '99213', description: 'Office visit for the evaluation and management of an established patient' },
    { id: 'proc2', code: '87880', description: 'Rapid strep test' },
    { id: 'proc3', code: '93000', description: 'Electrocardiogram, routine ECG with at least 12 leads' },
  ],
};

// Simulates an API call to search for a patient
export const searchPatient = (patientId: string): Promise<Patient | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (patientId === mockPatient.id) {
        resolve(mockPatient);
      } else {
        resolve(null);
      }
    }, 500);
  });
};

// Simulates an API call to get detailed data for a patient
export const getPatientData = (patientId: string): Promise<PatientData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (patientId === mockPatient.id) {
        resolve(mockPatientData);
      } else {
        reject(new Error('Patient data not found.'));
      }
    }, 800);
  });
};
