
import React, { useState } from 'react';
import type { Patient, PatientData } from './types';
import { searchPatient, getPatientData } from './services/fhirService';
import PatientSearch from './components/PatientSearch';
import PatientBanner from './components/PatientBanner';
import ClaimForm from './components/ClaimForm';
import { Spinner } from './components/ui/Spinner';

const App: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePatientSearch = async (patientId: string) => {
    setIsLoading(true);
    setError(null);
    setPatient(null);
    setPatientData(null);
    try {
      const foundPatient = await searchPatient(patientId);
      if (foundPatient) {
        setPatient(foundPatient);
        const data = await getPatientData(foundPatient.id);
        setPatientData(data);
      } else {
        setError(`Patient with ID "${patientId}" not found. Try "12345".`);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching patient data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPatient(null);
    setPatientData(null);
    setError(null);
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-800">
              FHIR AI Claim Submitter
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!patient ? (
          <div className="max-w-xl mx-auto">
             <PatientSearch onSearch={handlePatientSearch} isLoading={isLoading} />
              {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          </div>
        ) : (
          <div>
            <PatientBanner patient={patient} onReset={handleReset}/>
            {patientData ? (
              <ClaimForm patientData={patientData} patient={patient} onReset={handleReset} />
            ) : (
              <div className="flex justify-center items-center mt-8">
                <Spinner />
                <p className="ml-2">Loading patient details...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
