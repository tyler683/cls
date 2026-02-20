import { GoogleGenAI, Type } from '@google/genai';
import { DesignVisionResponse, ChatMessage } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
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

export const getChatResponse = async (history: ChatMessage[], userMessage: string): Promise<ChatResponse> => {
  try {
    // Initializing Gemini client with API key from environment
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let latLng = { latitude: 39.0997, longitude: -94.5786 };
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
      );
      latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {}

    // Using gemini-2.5-flash for maps grounding tasks as per guidelines
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: { latLng }
        }
      },
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
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    // Fix: Set maxOutputTokens and thinkingBudget together as per Gemini 3 guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Design concept for: "${userDescription}". Consider KC soil and climate.`,
      config: {
        systemInstruction: "You are a professional landscape architect specializing in Kansas City residential design.",
        maxOutputTokens: 6000,
        thinkingConfig: { thinkingBudget: 4000 },
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
    return JSON.parse(response.text || '{}') as DesignVisionResponse;
  } catch (error) {
    throw new Error("Failed to generate design vision.");
  }
};

export const generateLandscapeImage = async (imageUrl: string, prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let base64Data = imageUrl;
    if (imageUrl.startsWith('blob:')) base64Data = await blobUrlToBase64(imageUrl);
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';
    
    // Using gemini-2.5-flash-image for image editing/generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType } },
          { text: `Redesign landscape: ${prompt}. Cinematic, photorealistic, premium hardscaping design.` },
        ],
      },
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
  // Always create a fresh instance for video generation to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let base64Data = imageSrc;
  if (imageSrc.startsWith('blob:')) base64Data = await blobUrlToBase64(imageSrc);
  const cleanBase64 = base64Data.split(',')[1] || base64Data;
  const mimeType = base64Data.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

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
  const response = await fetch(`${downloadLink}&key=${GEMINI_API_KEY}`);
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};