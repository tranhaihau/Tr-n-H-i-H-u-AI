import { GoogleGenAI, Modality } from "@google/genai";

const getGenAIClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const generateImage = async (prompt: string, imageFile: File | null = null): Promise<string> => {
    const ai = getGenAIClient();
    try {
        const parts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: prompt }];

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.unshift(imagePart);
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ parts }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`The model returned a text response instead of an image: "${textResponse}"`);
        }
        throw new Error("No image data found in response.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
};

export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
    const ai = getGenAIClient();
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
                parts: [imagePart, textPart],
            }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`The model returned a text response instead of an image: "${textResponse}"`);
        }
        throw new Error("No image data found in response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. Please check the console for details.");
    }
};

export const faceSwap = async (sourceImage: File, targetImage: File, prompt: string): Promise<string> => {
    const ai = getGenAIClient();
    try {
        const sourceImagePart = await fileToGenerativePart(sourceImage);
        const targetImagePart = await fileToGenerativePart(targetImage);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
                parts: [sourceImagePart, targetImagePart, textPart],
            }],
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`The model returned a text response instead of an image: "${textResponse}"`);
        }
        throw new Error("No image data found in response.");

    } catch (error) {
        console.error("Error during faceswap:", error);
        throw new Error("Failed to perform faceswap. Please check the console for details.");
    }
};
