
import React from 'react';
import type { Patient } from '../types';
import { Card } from './ui/Card';

interface PatientBannerProps {
  patient: Patient;
  onReset: () => void;
}

const PatientInfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="text-md text-slate-800">{value}</p>
  </div>
);

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, onReset }) => {
    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

  return (
    <Card className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">{patient.name}</h2>
          <p className="text-sm text-slate-500">Patient ID: {patient.id}</p>
        </div>
        <button 
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150"
        >
            Start Over
        </button>
      </div>
      <div className="mt-4 border-t border-slate-200 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <PatientInfoItem label="Date of Birth" value={patient.birthDate} />
        <PatientInfoItem label="Age" value={`${calculateAge(patient.birthDate)} years`} />
        <PatientInfoItem label="Gender" value={patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} />
        <PatientInfoItem label="Address" value={patient.address} />
      </div>
    </Card>
  );
};

export default PatientBanner;