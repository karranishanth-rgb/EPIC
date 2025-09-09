import { GoogleGenAI } from "@google/genai";
import type { Condition, Procedure } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateClinicalJustification = async (
  diagnoses: Condition[],
  procedures: Procedure[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key not configured. Please ensure the API_KEY is set.");
  }
  
  const diagnosisList = diagnoses.map(d => `- ${d.description} (ICD-10: ${d.code})`).join('\n');
  const procedureList = procedures.map(p => `- ${p.description} (CPT: ${p.code})`).join('\n');

  const prompt = `
As a medical billing specialist, generate a concise clinical justification for an insurance claim based on the following information. The justification should be a professional narrative, 2-3 sentences long, explaining the medical necessity for the services rendered.

Patient Diagnoses:
${diagnosisList}

Procedures Performed:
${procedureList}

Generate the justification below:
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error generating clinical justification:", error);
    throw new Error("Failed to generate justification from AI service.");
  }
};

export const summarizePatientData = async (
  diagnoses: Condition[],
  procedures: Procedure[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("Gemini API key not configured. Please ensure the API_KEY is set.");
  }

  const diagnosisList = diagnoses.map(d => `- ${d.description} (ICD-10: ${d.code})`).join('\n');
  const procedureList = procedures.map(p => `- ${p.description} (CPT: ${p.code})`).join('\n');

  const prompt = `
As a medical professional, briefly summarize the following clinical information in 1-2 sentences. The summary should be easy for a non-medical person to understand, explaining the patient's main issues and the services performed.

Patient's Diagnoses:
${diagnosisList}

Procedures Performed:
${procedureList}

Plain-language summary:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating patient summary:", error);
    throw new Error("Failed to generate summary from AI service.");
  }
};
