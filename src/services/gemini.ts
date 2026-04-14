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

  // API 키 가져오기 (다양한 환경 대응)
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.error("Gemini API Key is missing. Please check your environment variables.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `당신은 신비롭고 지혜로운 꿈 해몽가입니다.
사용자가 다음 꿈을 꾸었습니다: "${dreamText}"
선택한 키워드: ${keywords.join(", ")}.

이 꿈에 대해 깊이 있고 시적이며 통찰력 있는 해석을 제공하세요.
어조는 신비롭고 공감적이며 심오하게 유지하세요.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `A surreal, symbolic, and dreamy illustration based on this dream: "${dreamText}". 
  Core theme: ${summary}. 
  Style: Soft, ethereal, abstract, oil painting style with deep blues, purples, and gold accents. 
  Atmosphere: Mysterious, emotional, and introspective.`;

  try {
    // 1. 이미 해몽 결과(data)에 포함된 이미지 주소를 가져옵니다.
    // 만약 코드 상단에 result라고 되어있으면 data 대신 result라고 적으세요.
    const imageUrl = data.image_prompt; 

    // 2. 가져온 주소를 반환합니다. 
    // 이렇게 하면 버튼을 눌렀을 때 구글을 거치지 않고 바로 이미지가 뜹니다.
    return imageUrl;

  } catch (error) {
    console.error("이미지를 불러오는 데 실패했습니다.", error);
    return null;
  }
}
