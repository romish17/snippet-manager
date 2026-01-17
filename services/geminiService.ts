import { GoogleGenAI } from "@google/genai";
import { Item, CategoryEnum } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhancePrompt = async (promptContent: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve the following prompt to be more precise, structured, and effective for an LLM. Return ONLY the improved prompt text without markdown backticks or explanations:\n\n${promptContent}`,
    });
    return response.text?.trim() || promptContent;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
};

export const explainItem = async (item: Item): Promise<string> => {
  try {
    const ai = getAiClient();
    let prompt = "";

    if (item.category === CategoryEnum.CODE) {
      prompt = `Explain what the following ${item.language || 'code'} snippet does clearly and concisely:\n\n${item.content}`;
    } else if (item.category === CategoryEnum.REGISTRY) {
      prompt = `Explain what this Windows Registry key does and the potential risks of modifying it:\nPath: ${item.registryPath}\nValue: ${item.content}\nType: ${item.registryType}`;
    } else {
      prompt = `Analyze this prompt and suggest what kind of output an AI would generate from it:\n\n${item.content}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Impossible de générer une explication.";
  } catch (error) {
    console.error("Error explaining item:", error);
    throw error;
  }
};
