import { GoogleGenAI, Type } from "@google/genai";

export interface DreamInterpretation {
  reflection: string;
  symbols: { name: string; meaning: string }[];
  emotionalInsight: string;
  summary: string;
  oneLiner: string;
}

// 로컬 사용량 추적을 위한 설정 (실제 API 쿼터는 서버측에서 관리하는 것이 좋으나, 여기서는 로컬 스토리지를 활용합니다)
const DAILY_LIMIT = 1500; // Gemini 2.0 Flash 무료 티어 기준
const QUOTA_THRESHOLD = 0.9; // 90% 임계값

function checkAndTrackUsage(): boolean {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `dream_decoder_usage_${today}`;
  
  const currentUsage = parseInt(localStorage.getItem(storageKey) || '0', 10);
  
  if (currentUsage >= DAILY_LIMIT * QUOTA_THRESHOLD) {
    console.warn(`사용량 임계값(${QUOTA_THRESHOLD * 100}%)에 도달했습니다. 현재 사용량: ${currentUsage}/${DAILY_LIMIT}`);
    return false;
  }
  
  localStorage.setItem(storageKey, (currentUsage + 1).toString());
  return true;
}

export async function interpretDream(dreamText: string, keywords: string[]): Promise<DreamInterpretation | null> {
  // 사용량 체크
  if (!checkAndTrackUsage()) {
    throw new Error("QUOTA_EXCEEDED_90");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `당신은 신비롭고 지혜로운 꿈 해몽가입니다.
사용자가 다음 꿈을 꾸었습니다: "${dreamText}"
선택한 키워드: ${keywords.join(", ")}.

이 꿈에 대해 깊이 있고 시적이며 통찰력 있는 해석을 제공하세요.
어조는 신비롭고 공감적이며 심오하게 유지하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: {
              type: Type.STRING,
              description: "A short poetic summary of the dream's emotional meaning.",
            },
            summary: {
              type: Type.STRING,
              description: "A concise 1-2 sentence summary of the dream's core message.",
            },
            oneLiner: {
              type: Type.STRING,
              description: "A catchy, shareable one-line interpretation.",
            },
            symbols: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the symbol" },
                  meaning: { type: Type.STRING, description: "Brief explanation of its meaning" },
                },
                required: ["name", "meaning"],
              },
              description: "2-3 dream symbols detected in the dream and their meanings.",
            },
            emotionalInsight: {
              type: Type.STRING,
              description: "Deep insight into the emotions and psychological state represented in the dream.",
            },
          },
          required: ["reflection", "summary", "oneLiner", "symbols", "emotionalInsight"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DreamInterpretation;
    }
    return null;
  } catch (error: any) {
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("API_QUOTA_EXHAUSTED");
    }
    console.error("Error interpreting dream:", error);
    return null;
  }
}

export async function generateDreamImage(dreamText: string, summary: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `A surreal, symbolic, and dreamy illustration based on this dream: "${dreamText}". 
  Core theme: ${summary}. 
  Style: Soft, ethereal, abstract, oil painting style with deep blues, purples, and gold accents. 
  Atmosphere: Mysterious, emotional, and introspective.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating dream image:", error);
    return null;
  }
}
