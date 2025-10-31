import { GoogleGenAI, Modality, Type, Chat } from "@google/genai";

const getGenAIClient = () => {
    // This function will be called right before an API call,
    // ensuring it uses the most up-to-date API key from the environment.
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

export const compositeImages = async (image1: File, image2: File, prompt: string): Promise<string> => {
    const ai = getGenAIClient();
    try {
        const image1Part = await fileToGenerativePart(image1);
        const image2Part = await fileToGenerativePart(image2);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
                parts: [image1Part, image2Part, textPart],
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
        console.error("Error during image compositing:", error);
        throw new Error("Failed to composite images. Please check the console for details.");
    }
};

export const createChatSession = (): Chat => {
    const ai = getGenAIClient();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
    });
};

export const analyzeScript = async (fullScript: string, videoCount: number, sync: boolean): Promise<string[]> => {
    const ai = getGenAIClient();
    
    const syncInstruction = sync
      ? `It is crucial that you maintain consistency across all generated scenes. The characters (e.g., 'a knight in silver armor'), environment, and artistic style must be continuous. Each prompt should build upon the last to form a single, coherent narrative.`
      : '';
      
    const prompt = `Analyze the following video script and split it into ${videoCount} sequential, logical scenes. Each scene should be a prompt suitable for a text-to-video AI model. Ensure the scenes flow together to tell the story of the original script. ${syncInstruction}

Script:
---
${fullScript}
---

Return the result as a JSON array of strings, where each string is a prompt for one video scene.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A prompt for a single video scene.'
                            }
                        }
                    },
                    required: ['scenes']
                },
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        if (result && result.scenes && Array.isArray(result.scenes)) {
            return result.scenes;
        } else {
            throw new Error("AI response did not contain a valid 'scenes' array.");
        }
    } catch (error) {
        console.error("Error analyzing script:", error);
        throw new Error("Failed to analyze script. The AI may have returned an unexpected format.");
    }
};

export const generateVideo = async (
    prompt: string, 
    imageFile: File | null, 
    onProgress: (message: string) => void
): Promise<string> => {
    onProgress('Khởi tạo AI...');
    const ai = getGenAIClient();
    const model = 'veo-3.1-fast-generate-preview';

    const requestPayload: any = {
        model,
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    };

    if (imageFile) {
        onProgress('Đang xử lý ảnh tham khảo...');
        const imagePart = await fileToGenerativePart(imageFile);
        requestPayload.image = {
            imageBytes: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType
        };
    }

    onProgress('Đang gửi yêu cầu tạo video...');
    let operation = await ai.models.generateVideos(requestPayload);
    
    let pollCount = 0;
    while (!operation.done) {
        pollCount++;
        onProgress(`AI đang xử lý video... (Lần kiểm tra ${pollCount})`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress('Video đã được tạo! Đang lấy link tải...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Không tìm thấy link video trong kết quả trả về.");
    }
    
    // The Gemini docs state that the API key must be appended when fetching the video blob
    const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    onProgress('Đang tải dữ liệu video...');
    const videoResponse = await fetch(finalUrl);
    if (!videoResponse.ok) {
        const errorBody = await videoResponse.text();
        console.error("Failed to fetch video:", errorBody);
        throw new Error(`Failed to fetch video data: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};