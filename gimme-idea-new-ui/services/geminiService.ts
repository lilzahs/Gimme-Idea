import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const validateProjectIdea = async (idea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: idea,
      config: {
        systemInstruction: `You are a senior Solana Ecosystem Auditor and Venture Capitalist. 
        Review the following project idea. 
        Provide a structured critique in strict Markdown format (no JSON).
        Focus on:
        1. Technical Feasibility on Solana (Is it possible? Scalable? Accounts constraints?).
        2. Market Viability (Does this exist? Is it needed?).
        3. Constructive Criticism (What needs to change?).
        
        Keep the tone professional, slightly critical but encouraging ("Builder-first" mentality).
        Limit response to 200 words.`,
        thinkingConfig: { thinkingBudget: 0 } // Low latency preferred for UI interaction
      }
    });

    return response.text || "Unable to analyze at this moment. The network is congested.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "## System Error\n\nUnable to connect to the validation node. Please try again later.";
  }
};