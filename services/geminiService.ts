import { GoogleGenAI, Chat } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

let globalChatSession: Chat | null = null;
let currentApiKey: string | null = null;
let currentSystemInstruction: string | null = null;

export const initializeChatSession = (apiKey: string, systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION): Chat | null => {
  // Re-initialize if key changes OR system instruction changes OR session doesn't exist
  if (!globalChatSession || currentApiKey !== apiKey || currentSystemInstruction !== systemInstruction) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      globalChatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
      });
      currentApiKey = apiKey;
      currentSystemInstruction = systemInstruction;
      console.log("Gemini Session Re-initialized with new settings");
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      globalChatSession = null;
    }
  }
  return globalChatSession;
};

export const streamResponse = async function* (message: string, apiKey: string, systemInstruction: string) {
  if (!apiKey) {
    yield "Error: Gemini API Key is missing. Please set it in the settings.";
    return;
  }

  const chat = initializeChatSession(apiKey, systemInstruction);
  if (!chat) {
    yield "Error: Gemini API client failed to initialize with the provided key.";
    return;
  }

  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = (error.message || String(error)).toLowerCase();
    
    if (errorMessage.includes("api key not valid") || errorMessage.includes("authentication failed")) {
        yield "\n\n(Error: Invalid API Key. Please check your key in settings.)";
    } else if (errorMessage.includes("requested entity was not found")) {
        yield "\n\n(Error: Requested entity was not found. This might indicate an issue with the API key or model access.)";
    } else {
         yield "\n\n(I encountered an error processing that request.)";
    }
  }
};