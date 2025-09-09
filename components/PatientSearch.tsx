import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

interface PatientSearchProps {
  onSearch: (patientId: string) => void;
  isLoading: boolean;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSearch, isLoading }) => {
  const [patientId, setPatientId] = useState<string>('1288992');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      onSearch(patientId.trim());
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-center text-slate-700 mb-2">Find Patient Record</h2>
      <p className="text-center text-slate-500 mb-6">Enter a patient's full name or numeric ID to begin.</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="e.g., John Hart or 1288992"
          className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !patientId.trim()} className="w-full sm:w-auto">
          {isLoading ? <Spinner size="sm" /> : 'Search'}
        </Button>
      </form>
    </div>
  );
};

export default PatientSearch;