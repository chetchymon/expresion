import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK lazily to prevent crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in the Secrets panel in Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

interface LandmarkSummary {
  faceFound: boolean;
  landmarksCount?: number;
  simplifiedData?: any; // Simple summary (e.g. bounding box, relative distance of eyebrows/lips)
}

/**
 * Sends the face image and MediaPipe landmark summary to Gemini to generate
 * a highly detailed prompt specifically representing the facial expression.
 */
export async function generateExpressionPrompt(
  base64Data: string,
  mimeType: string,
  landmarkSummary: LandmarkSummary
): Promise<string> {
  const client = getGeminiClient();

  // Create image part for the Gemini SDK
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const landmarkNotes = landmarkSummary.faceFound && landmarkSummary.simplifiedData
    ? `\nMediaPipe Facial Landmarks Analysis:
- Head orientation / rotation estimation: ${JSON.stringify(landmarkSummary.simplifiedData.headPose || "N/A")}
- Eyebrow openness (distance relative to eye height): ${JSON.stringify(landmarkSummary.simplifiedData.browOpenness || "N/A")}
- Eye aspect ratios (squint indicator): ${JSON.stringify(landmarkSummary.simplifiedData.eyeRatio || "N/A")}
- Mouth openness & stretch ratio: ${JSON.stringify(landmarkSummary.simplifiedData.mouthRatio || "N/A")}
- Smile coefficient: ${JSON.stringify(landmarkSummary.simplifiedData.smileCoefficient || "N/A")}
- Number of landmarks tracked: ${landmarkSummary.landmarksCount}`
    : "\n(Note: Direct canvas facial landmarks could not be fully analyzed. Rely purely on image visual analysis.)";

  const systemInstruction = `You are "ExpressionPrompt AI", an expert prompt engineer specializing in hyper-accurate replica details of human facial expressions for advanced modern AI image generators (such as Midjourney, Flux, SDXL, and ChatGPT).
Your task is to analyze the face of the uploaded image AND some supplementary raw MediaPipe spatial readings to build an extremely descriptive, highly professional, reusable prompting sentence.

Focus ONLY on the facial expression details. Avoid describing the person's clothing, background, accessories, age, gender, ethnicity, or beauty. Do NOT make a generic caption or recount the scene. Focus entirely on the muscle groups and facial mechanics.

Your generated output should be a single rich paragraph or comma-separated phrasing optimized for image generator weights.
Specifically, inspect and describe:
1. Mouth Shape: Use simple, clean, wholesome terms like "cheerful broad grin", "wide open comedic mouth", "happy laughing mouth", "funny puffed cheeks", or "humorous cartoon-style gasp".
2. Eyes & Eyebrows: Use happy / curious terms like "wide eyes of playful curiosity", "funny raised eyebrows", "comedic squint", or "bright eyes".
3. Cheeks & Nose: Use funny friendly terms like "elevated happy cheeks", "wrinkled nose of playful confusion", or "expressive laugh lines".
4. Head Posture: Head tilt angle, whimsical lean.

CRITICAL SAFETY & CHATGPT/DALL-E 3 COMPATIBILITY RULES:
- ChatGPT (DALL-E 3) has extremely strict filters for underage subjects (teens and children). You MUST NOT use any words that could be flagged by sensitive safety shields.
- STRICTLY FORBIDDEN keywords (DO NOT use these under any circumstance): "pout", "lip bite", "biting", "sensual", "intense", "gaze", "tension", "parted lips", "lip tension", "clenched teeth", "flesh", "forceful", "gasping", "menacing", "villain", "malicious", "uncanny", "screaming", "crying".
- Replace them with delightful, safe descriptors: "playful grin", "funny cartoon-style gasp", "silly puff of the cheeks", "cheerful surprise", "curious high brows", "comedic smile".
- Keep the overall vibe Pixar-like, lighthearted, colorful, safe, and family-friendly.

OUTPUT FORMAT:
Generate ONLY the high-quality prompt, started with no intro, no conversational fluff, no commentary. It must look like a pure prompt. E.g.: "Hyper-detailed cartoonishly surprised facial expression, ..."`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      imagePart,
      {
        text: `Analyze this facial image for expression cloning.${landmarkNotes}\n\nGenerate the ultimate facial expression reproduction prompt:`,
      },
    ],
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  });

  return response.text || "Failed to generate prompt from Gemini.";
}

/**
 * Generates an image using an image generation model based on the analyzed expression prompt.
 */
export async function generateImage(
  expressionPrompt: string,
  style: string = "Pixar 3D animated style"
): Promise<string> {
  const client = getGeminiClient();
  
  // Format prompt for wholesome safe DALL-E / ChatGPT styled outputs but with Gemini-Image
  const cleanExpression = expressionPrompt.replace(/^Hyper-detailed\s+/i, "");
  const fullPrompt = `A delightful, adorable 3D animated digital character in a beautiful ${style}. The character is expressing: ${cleanExpression}. Single character centered close-up, highly detailed portrait, colorful, wholesome, Pixar and Disney aesthetic, perfect 3D render, studio lighting.`;

  console.log("Generating with full image prompt:", fullPrompt);

  try {
    // 1. Try gemini-2.5-flash-image
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No inline image data found in first candidate.");
  } catch (err: any) {
    console.warn("First model (gemini-2.5-flash-image) failed, trying fallback:", err);
    try {
      // 2. Try fallback to Imagen
      const response = await client.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: "1:1",
        },
      });
      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
      }
      throw new Error("No imageBytes found in Imagen response.");
    } catch (fallbackErr: any) {
      console.error("All image generation models failed:", fallbackErr);
      throw new Error(`Failed to generate image: ${fallbackErr.message || fallbackErr}`);
    }
  }
}

