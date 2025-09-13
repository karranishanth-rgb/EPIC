import type { Condition, Procedure } from "../types";

export const generateClinicalJustification = async (
  diagnoses: Condition[],
  procedures: Procedure[]
): Promise<string> => {
  console.warn("Gemini API dependency removed. Returning mock justification.");
  return new Promise(resolve => setTimeout(() => resolve("This is a mock clinical justification. The services provided were deemed medically necessary for the patient's diagnosed conditions, ensuring proper evaluation and management."), 1000));
};

export const summarizePatientData = async (
  diagnoses: Condition[],
  procedures: Procedure[]
): Promise<string> => {
  console.warn("Gemini API dependency removed. Returning mock summary.");
  return new Promise(resolve => setTimeout(() => resolve("This is a mock patient summary. The patient presented with several conditions and received corresponding procedures for evaluation and management."), 1000));
};
