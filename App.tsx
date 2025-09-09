
import React, { useState, useEffect } from 'react';
import type { Patient, PatientData } from './types';
import { getPatientAndData } from './services/fhirService';
import PatientBanner from './components/PatientBanner';
import ClaimForm from './components/ClaimForm';
import { Spinner } from './components/ui/Spinner';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

// FIX: Declare the fhirclient global object to resolve 'Cannot find name 'FHIR'' error.
declare const FHIR: any;

// A new component for the login screen
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="max-w-xl mx-auto text-center">
    <Card>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Connect to Health Record</h2>
      <p className="text-slate-500 mb-6">
        This application uses the SMART on FHIR protocol to securely connect to a patient's electronic health record.
      </p>
      <Button onClick={onLogin}>
        Launch & Connect to FHIR Server
      </Button>
      <p className="text-xs text-slate-400 mt-4">
        You will be redirected to the sandbox login page to select a patient and authorize access.
      </p>
    </Card>
  </div>
);

const App: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start with no loading
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once on mount to handle the SMART on FHIR auth flow.
    // We check for `code` and `state` params in the URL. If they exist, we are in the redirect phase.
    if (window.location.search.includes('code') && window.location.search.includes('state')) {
      setIsLoading(true); // Show loader only during the handshake
      FHIR.oauth2.ready({ completeInTarget: true })
        .then((client: any) => {
          // Successfully authorized, we have a client instance. Now fetch data.
          setError(null);
          return getPatientAndData(client); // Return the promise to chain .then()
        })
        .then(({ patient, patientData }) => {
          // Data fetched successfully
          setPatient(patient);
          setPatientData(patientData);
        })
        .catch((err: Error) => {
          console.error("SMART on FHIR flow error:", err);
          // Provide more specific feedback based on the error type
          if (err.message.includes("Failed to fetch")) {
            setError("Successfully authorized, but failed to fetch patient data from the server. The server may be experiencing issues. Please try again.");
          } else {
            setError("An OAuth2 error occurred after returning from the server. This can be caused by a misconfiguration or temporary server issue. Please try again.");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // If no auth params, do nothing and wait for user to click "Launch".
  }, []); // Empty dependency array ensures this runs only once

  const handleLogin = () => {
    setIsLoading(true);
    setError(null);

    // Use a more robust way to define the redirect URI
    const redirectUri = window.location.origin + window.location.pathname;

    // This configuration uses the public SMART Health IT sandbox, which is open for development
    // and does not have the strict CORS policies that Epic's server has, resolving the connection error.
    const smartConfig = {
      iss: 'https://launch.smarthealthit.org/v/r4/fhir',
      redirectUri: redirectUri,
      // No client ID is needed for this public sandbox.
      // Scopes define the permissions the app is requesting.
      scope: 'launch/patient patient/*.read openid fhirUser offline_access',
    };

    FHIR.oauth2.authorize(smartConfig).catch((err: Error) => {
      console.error("Failed to initiate authorization:", err);
      setError("Failed to start the authorization redirect. This can be caused by pop-up blockers or a temporary issue with the FHIR server. Please try again.");
      setIsLoading(false);
    });
  };

  const handleReset = () => {
    // A simple way to "log out" is to clear state and reload the page to its initial state.
    setPatient(null);
    setPatientData(null);
    setError(null);
    // Use the same robust redirect URI method
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = redirectUri;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center mt-20">
          <Spinner />
          <p className="ml-3 text-slate-600">Connecting to FHIR server...</p>
        </div>
      );
    }

    if (error) {
      return <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>;
    }
    
    if (patient && patientData) {
      return (
        <div>
          <PatientBanner patient={patient} onReset={handleReset}/>
          <ClaimForm patientData={patientData} patient={patient} onReset={handleReset} />
        </div>
      );
    }
    
    // If not loading, no error, and no patient data, show the login screen.
    return <LoginScreen onLogin={handleLogin} />;
  };

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
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
