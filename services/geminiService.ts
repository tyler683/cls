import { GoogleGenAI, Type } from '@google/genai';
import { DesignVisionResponse, ChatMessage } from "../types";

// Up to three Gemini API keys — rotate round-robin and fall back on quota errors.
const GEMINI_API_KEYS: string[] = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

/** Returns the next API key in round-robin order. */
const nextKey = (): string => {
  if (GEMINI_API_KEYS.length === 0) return '';
  const key = GEMINI_API_KEYS[currentKeyIndex % GEMINI_API_KEYS.length];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
};

const isQuotaError = (err: unknown): boolean => {
  const e = err as any;
  if (e?.status === 429) return true;
  if (typeof e?.code === 'string' && e.code.toUpperCase() === 'RESOURCE_EXHAUSTED') return true;
  const msg = String(e?.message ?? '').toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota exceeded');
};

/**
 * Calls `fn` with each available API key in order, moving to the next key only
 * when the current one returns a quota / rate-limit error.  Non-quota errors are
 * rethrown immediately so callers receive meaningful messages.
 */
const withKeyFallback = async <T>(fn: (apiKey: string) => Promise<T>): Promise<T> => {
  if (GEMINI_API_KEYS.length === 0) return fn('');
  let lastErr: unknown;
  const start = currentKeyIndex;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[(start + i) % GEMINI_API_KEYS.length];
    try {
      const result = await fn(key);
      currentKeyIndex = (start + i + 1) % GEMINI_API_KEYS.length;
      return result;
    } catch (err) {
      if (!isQuotaError(err)) throw err;
      lastErr = err;
    }
  }
  throw new Error(`All ${GEMINI_API_KEYS.length} Gemini API key(s) exhausted due to rate limits.`, { cause: lastErr });
};

const SYSTEM_INSTRUCTION = `
You are the helpful, friendly, and professional virtual assistant for "Creative Landscaping Solutions", a family-owned landscaping company in Kansas City, MO.
Owner: Tyler Dennison.

Your goal is to answer questions about services and provide local expertise.

Local Knowledge:
- You are an expert on Kansas City neighborhoods: Leawood, Overland Park, Brookside, Mission Hills, Liberty, and Lee's Summit.
- You know about Missouri-native plants (Purple Coneflower, Little Bluestem) and KC's heavy clay soil.
- When asked about specific areas, use the Google Maps tool to reference real landmarks or neighborhood characteristics.

Tone:
- Warm, earthy, and professional ("Hard Work. Honest Roots.").
- If the user asks about a location, provide a helpful link to show you know the area.
`;

export interface ChatResponse {
  text: string;
  groundingLinks: { title: string; uri: string }[];
}

const blobUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
       const res = reader.result as string;
       resolve(res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const MAX_HISTORY_MESSAGES = 10;

export const getChatResponse = async (history: ChatMessage[], userMessage: string): Promise<ChatResponse> => {
  try {
    let latLng = { latitude: 39.0997, longitude: -94.5786 };
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
      );
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {}

    // Use gemini-2.0-flash for cost-effective chat; limit history to reduce tokens per call
    const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);
    const response = await withKeyFallback((apiKey) => {
      const ai = new GoogleGenAI({ apiKey });
      return ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          ...trimmedHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 1024,
          tools: [{ googleSearch: {} }],
          toolConfig: {
            retrievalConfig: { latLng }
          }
        },
      });
    });

    const links: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps) links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      if (chunk.web) links.push({ title: chunk.web.title, uri: chunk.web.uri });
    });

    // Extract text directly from response property
    return {
      text: response.text || "I'm sorry, I couldn't process that.",
      groundingLinks: Array.from(new Map(links.map(l => [l.uri, l])).values())
    };
  } catch (error) {
    console.error("Chat API Error:", error);
    return { text: "I'm having a little trouble connecting. Call Tyler at (816) 337-2654.", groundingLinks: [] };
  }
};

export const generateDesignVision = async (userDescription: string): Promise<DesignVisionResponse> => {
  try {
    // Use gemini-2.0-flash for cost-effective design vision generation
    const response = await withKeyFallback((apiKey) => {
      const ai = new GoogleGenAI({ apiKey });
      return ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Design concept for: "${userDescription}". Consider KC soil and climate.`,
        config: {
          systemInstruction: "You are a professional landscape architect specializing in Kansas City residential design.",
          maxOutputTokens: 2000,
          thinkingConfig: { thinkingBudget: 1000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conceptName: { type: Type.STRING },
              mood: { type: Type.STRING },
              plantPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              features: { type: Type.ARRAY, items: { type: Type.STRING } },
              maintenanceLevel: { type: Type.STRING },
            },
            required: ["conceptName", "mood", "plantPalette", "features", "maintenanceLevel"],
          },
        },
      });
    });
    return JSON.parse(response.text || '{}') as DesignVisionResponse;
  } catch (error) {
    throw new Error("Failed to generate design vision.");
  }
};

export const generateLandscapeImage = async (imageUrl: string, prompt: string): Promise<string> => {
  try {
    let base64Data = imageUrl;
    if (imageUrl.startsWith('blob:')) base64Data = await blobUrlToBase64(imageUrl);
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
    
    // Using gemini-2.0-flash-exp which supports multimodal image output
    const response = await withKeyFallback((apiKey) => {
      const ai = new GoogleGenAI({ apiKey });
      return ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType } },
            { text: `Redesign landscape: ${prompt}. Cinematic, photorealistic, premium hardscaping design.` },
          ],
        },
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });
    });
    for (const cand of response.candidates || []) {
      for (const part of cand.content?.parts || []) {
        // Correctly find the image part in the response
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    throw new Error("Failed to generate visualization.");
  }
};

export const generateLandscapeVideo = async (imageSrc: string, prompt: string): Promise<string> => {
  let base64Data = imageSrc;
  if (imageSrc.startsWith('blob:')) base64Data = await blobUrlToBase64(imageSrc);
  const cleanBase64 = base64Data.split(',')[1] || base64Data;
  const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

  // Pin the key for the entire multi-step video operation so polling uses the same key.
  const apiKey = nextKey();
  const ai = new GoogleGenAI({ apiKey });

  // Using veo-3.1-fast-generate-preview for high-quality video generation
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A slow cinematic 4k aerial drone shot of this landscaped garden: ${prompt}. High-end lighting, lush plants, luxury hardscaping.`,
    image: {
      imageBytes: cleanBase64,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Polling for video generation completion as per Veo usage guidelines
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  // Appending API key for authenticated video download
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};