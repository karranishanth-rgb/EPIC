import React, { useState, useCallback, useEffect } from 'react';
import type { PatientData, Encounter, Condition, Procedure, Claim, Patient } from '../types';
import { generateClinicalJustification, summarizePatientData } from '../services/geminiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import StepIndicator from './StepIndicator';
import { CheckIcon } from './icons/CheckIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface ClaimFormProps {
  patientData: PatientData;
  patient: Patient;
  onReset: () => void;
}

const STEPS = ['Select Encounter', 'Add Details', 'Review & Justify', 'Submitted'];

const ClaimForm: React.FC<ClaimFormProps> = ({ patientData, patient, onReset }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);
  const [justification, setJustification] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientSummary, setPatientSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);


  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => {
    if (currentStep === 2) {
      setPatientSummary('');
      setSummaryError(null);
    }
    setCurrentStep(prev => prev - 1)
  };

  useEffect(() => {
    if (currentStep === 2 && !patientSummary && !isSummarizing) {
        const generateSummary = async () => {
            if (selectedConditions.length === 0 || selectedProcedures.length === 0) return;
            setIsSummarizing(true);
            setSummaryError(null);
            try {
                const summary = await summarizePatientData(selectedConditions, selectedProcedures);
                setPatientSummary(summary);
            } catch (err) {
                setSummaryError("Failed to generate AI summary. You can still review the details below.");
            } finally {
                setIsSummarizing(false);
            }
        };
        generateSummary();
    }
  }, [currentStep, patientSummary, isSummarizing, selectedConditions, selectedProcedures]);

  const handleEncounterSelect = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    handleNext();
  };

  const toggleSelection = <T extends { id: string }>(item: T, list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (list.some(i => i.id === item.id)) {
      setList(list.filter(i => i.id !== item.id));
    } else {
      setList([...list, item]);
    }
  };
  
  const generateJustification = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateClinicalJustification(selectedConditions, selectedProcedures);
      setJustification(result);
      handleNext();
    } catch (err) {
      setError("Failed to generate AI justification. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedConditions, selectedProcedures]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <SelectEncounterStep encounters={patientData.encounters} onSelect={handleEncounterSelect} />;
      case 1:
        return (
          <AddDetailsStep
            conditions={patientData.conditions}
            procedures={patientData.procedures}
            selectedConditions={selectedConditions}
            selectedProcedures={selectedProcedures}
            onToggleCondition={(c) => toggleSelection(c, selectedConditions, setSelectedConditions)}
            onToggleProcedure={(p) => toggleSelection(p, selectedProcedures, setSelectedProcedures)}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ReviewStep
            encounter={selectedEncounter!}
            conditions={selectedConditions}
            procedures={selectedProcedures}
            onBack={handleBack}
            onGenerate={generateJustification}
            isGenerating={isGenerating}
            error={error}
            summary={patientSummary}
            isSummarizing={isSummarizing}
            summaryError={summaryError}
          />
        );
      case 3:
        return (
            <SubmissionStep
                patient={patient}
                encounter={selectedEncounter!}
                conditions={selectedConditions}
                procedures={selectedProcedures}
                justification={justification}
                onReset={onReset}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      <div className="mt-8">
        {renderStepContent()}
      </div>
    </div>
  );
};

// Sub-components for each step
const SelectEncounterStep: React.FC<{ encounters: Encounter[], onSelect: (e: Encounter) => void }> = ({ encounters, onSelect }) => (
    <Card>
      <h3 className="text-xl font-semibold mb-4">Select an Encounter</h3>
      <div className="space-y-3">
        {encounters.map(enc => (
          <div key={enc.id} className="p-4 border rounded-md hover:bg-slate-50 transition-colors flex justify-between items-center">
            <div>
              <p className="font-semibold">{enc.type} on {enc.date}</p>
              <p className="text-sm text-slate-500">with {enc.practitioner}</p>
            </div>
            <Button onClick={() => onSelect(enc)}>Select</Button>
          </div>
        ))}
      </div>
    </Card>
);

const AddDetailsStep: React.FC<{
    conditions: Condition[], procedures: Procedure[], selectedConditions: Condition[], selectedProcedures: Procedure[],
    onToggleCondition: (c: Condition) => void, onToggleProcedure: (p: Procedure) => void,
    onBack: () => void, onNext: () => void
}> = ({ conditions, procedures, selectedConditions, selectedProcedures, onToggleCondition, onToggleProcedure, onBack, onNext }) => (
    <Card>
      <h3 className="text-xl font-semibold mb-4">Add Diagnoses and Procedures</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SelectionList title="Diagnoses (Conditions)" items={conditions} selectedItems={selectedConditions} onToggle={onToggleCondition} />
        <SelectionList title="Procedures" items={procedures} selectedItems={selectedProcedures} onToggle={onToggleProcedure} />
      </div>
      <div className="flex justify-between mt-8 border-t pt-4">
        <Button onClick={onBack} variant="secondary">Back</Button>
        <Button onClick={onNext} disabled={selectedConditions.length === 0 || selectedProcedures.length === 0}>
          Review Claim
        </Button>
      </div>
    </Card>
);

const SelectionList = <T extends { id: string, code: string, description: string }>({ title, items, selectedItems, onToggle }: {
    title: string, items: T[], selectedItems: T[], onToggle: (item: T) => void
}) => (
    <div>
      <h4 className="font-semibold text-lg mb-2">{title}</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 border rounded-md p-2 bg-slate-50">
        {items.map(item => (
          <label key={item.id} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedItems.some(i => i.id === item.id)}
              onChange={() => onToggle(item)}
            />
            <span className="ml-3 text-sm">
              <span className="font-medium text-slate-800">{item.code}</span> - {item.description}
            </span>
          </label>
        ))}
      </div>
    </div>
);


const ReviewStep: React.FC<{
    encounter: Encounter, conditions: Condition[], procedures: Procedure[],
    onBack: () => void, onGenerate: () => void, isGenerating: boolean, error: string | null,
    summary: string, isSummarizing: boolean, summaryError: string | null
}> = ({ encounter, conditions, procedures, onBack, onGenerate, isGenerating, error, summary, isSummarizing, summaryError }) => (
    <Card>
      <h3 className="text-xl font-semibold mb-4">Review Claim Details</h3>
      <div className="space-y-6">
        <ReviewSection title="AI-Powered Summary">
          {isSummarizing && (
            <div className="flex items-center text-slate-500 text-sm">
              <Spinner size="sm" />
              <span className="ml-2">Generating patient summary...</span>
            </div>
          )}
          {summaryError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{summaryError}</p>}
          {summary && !isSummarizing && (
            <blockquote className="border-l-4 border-blue-200 pl-4 py-1 text-slate-600">
              <p className="italic">{summary}</p>
            </blockquote>
          )}
        </ReviewSection>
        <ReviewSection title="Encounter Details">
            <p>{encounter.type} with {encounter.practitioner} on {encounter.date}</p>
        </ReviewSection>
        <ReviewSection title="Selected Diagnoses">
            <ul className="list-disc list-inside text-slate-600">
                {conditions.map(c => <li key={c.id}>{c.description} ({c.code})</li>)}
            </ul>
        </ReviewSection>
        <ReviewSection title="Selected Procedures">
             <ul className="list-disc list-inside text-slate-600">
                {procedures.map(p => <li key={p.id}>{p.description} ({p.code})</li>)}
            </ul>
        </ReviewSection>
      </div>
      {error && <p className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      <div className="flex justify-between mt-8 border-t pt-4">
        <Button onClick={onBack} variant="secondary" disabled={isGenerating}>Back</Button>
        <Button onClick={onGenerate} disabled={isGenerating || isSummarizing}>
          {isGenerating ? <><Spinner size="sm" /> Generating...</> : 'Generate Justification & Submit'}
        </Button>
      </div>
    </Card>
);

const ReviewSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h4 className="font-semibold text-md text-slate-700 border-b pb-1 mb-2">{title}</h4>
        <div className="text-sm">{children}</div>
    </div>
);

const SubmissionStep: React.FC<{
    patient: Patient, encounter: Encounter, conditions: Condition[], procedures: Procedure[],
    justification: string, onReset: () => void
}> = ({ patient, encounter, conditions, procedures, justification, onReset }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(justification);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
    <Card className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckIcon className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-semibold mt-4">Claim Submitted Successfully</h3>
      <p className="text-slate-500 mt-2">A claim for <span className="font-semibold">{patient.name}</span> has been processed.</p>
      
      <div className="text-left bg-slate-50 border rounded-lg p-4 mt-6 space-y-4">
        <h4 className="font-semibold text-lg text-slate-800">Generated Clinical Justification</h4>
        <p className="text-slate-600 text-sm italic">"{justification}"</p>
        <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center space-x-1 transition-colors">
            {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
        </button>
      </div>
      
      <div className="mt-8">
        <Button onClick={onReset}>Submit Another Claim</Button>
      </div>
    </Card>
);
}

export default ClaimForm;
