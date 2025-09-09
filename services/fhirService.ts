import type { Patient, PatientData, Encounter, Condition, Procedure } from '../types';

// FHIR resources can be complex, so we define simplified types for what we expect to parse.
// This helps with type safety when processing the raw API response.
type FhirPatient = any; 
type FhirBundle = { entry?: { resource: any }[] };


// --- Data Parsing Helpers ---

/**
 * Parses a raw FHIR Patient resource into our simplified Patient type.
 * @param fhirPatient - The raw FHIR Patient resource.
 * @returns A Patient object or null if parsing fails.
 */
const parseFhirPatient = (fhirPatient: FhirPatient): Patient | null => {
  try {
    const name = fhirPatient.name?.[0];
    const address = fhirPatient.address?.[0];

    return {
      id: fhirPatient.id,
      name: name ? `${(name.given || []).join(' ')} ${name.family || ''}`.trim() : 'Unknown Name',
      birthDate: fhirPatient.birthDate || 'Unknown',
      gender: fhirPatient.gender || 'unknown',
      address: address 
        ? `${address.line?.join(', ') || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.replace(/^, |, $/g, '')
        : 'No address on file',
    };
  } catch (error) {
    console.error("Error parsing FHIR Patient resource:", error, fhirPatient);
    return null;
  }
};

const parseFhirEncounter = (resource: any): Encounter | null => ({
  id: resource.id,
  date: resource.period?.start?.split('T')[0] || 'Unknown Date',
  type: resource.type?.[0]?.text || 'Encounter',
  practitioner: resource.participant?.[0]?.individual?.display || 'Unknown Practitioner',
});

const parseFhirCondition = (resource: any): Condition | null => ({
  id: resource.id,
  code: resource.code?.coding?.[0]?.code || 'N/A',
  description: resource.code?.text || 'No description provided',
});

const parseFhirProcedure = (resource: any): Procedure | null => ({
  id: resource.id,
  code: resource.code?.coding?.[0]?.code || 'N/A',
  description: resource.code?.text || 'No description provided',
});

/**
 * Parses the result of a Patient/$everything FHIR query.
 * This bundle contains the patient resource plus all related resources.
 * @param bundle - The FHIR bundle from the $everything operation.
 * @param patientId - The ID of the patient we are looking for.
 * @returns An object containing the parsed Patient and PatientData.
 */
const parseEverythingBundle = (bundle: FhirBundle, patientId: string): { patient: Patient | null; patientData: PatientData } => {
  let patient: Patient | null = null;
  const patientData: PatientData = {
    encounters: [],
    conditions: [],
    procedures: [],
  };

  if (!bundle?.entry) {
    return { patient, patientData };
  }

  for (const entry of bundle.entry) {
    const resource = entry.resource;
    if (!resource) continue;

    switch (resource.resourceType) {
      case 'Patient':
        // The patient who is the subject of the call will have a matching ID.
        if (resource.id === patientId) {
          patient = parseFhirPatient(resource);
        }
        break;
      case 'Encounter':
        const encounter = parseFhirEncounter(resource);
        if (encounter) patientData.encounters.push(encounter);
        break;
      case 'Condition':
        const condition = parseFhirCondition(resource);
        if (condition) patientData.conditions.push(condition);
        break;
      case 'Procedure':
        const procedure = parseFhirProcedure(resource);
        if (procedure) patientData.procedures.push(procedure);
        break;
      default:
        // Ignore other resource types
        break;
    }
  }

  return { patient, patientData };
};


// --- API Service Functions ---

/**
 * Fetches the patient and their detailed clinical data using an authorized SMART on FHIR client.
 * This version uses the Patient/$everything operation for improved performance and resilience.
 * @param client - The authorized fhirclient instance.
 * @returns A Promise resolving to an object containing the Patient and PatientData.
 */
export const getPatientAndData = async (client: any): Promise<{ patient: Patient; patientData: PatientData }> => {
  try {
    const patientId = client.patient.id;
    if (!patientId) {
      throw new Error("Could not resolve patient ID from SMART client.");
    }

    // Use the $everything operation to fetch all patient data in a single request.
    const everythingBundle = await client.request(`Patient/${patientId}/$everything`);
    
    // Pass patientId to ensure we parse the correct patient from the bundle.
    const { patient, patientData } = parseEverythingBundle(everythingBundle, patientId);

    if (!patient) {
      // As a fallback, if patient wasn't in the bundle, read it directly.
      // This can happen with some server implementations of $everything.
      console.warn(`Patient resource not found in $everything bundle. Fetching directly.`);
      const patientResource = await client.patient.read();
      const fallbackPatient = parseFhirPatient(patientResource);
      if (!fallbackPatient) {
        throw new Error("Failed to parse patient resource from direct fetch.");
      }
      
      // Sort encounters by date (most recent first) for a better UX.
      patientData.encounters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { patient: fallbackPatient, patientData };
    }

    // Sort encounters by date (most recent first) for a better UX.
    patientData.encounters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { patient, patientData };

  } catch (error) {
    console.error(`Failed to fetch data using SMART client:`, error);
    throw error;
  }
};