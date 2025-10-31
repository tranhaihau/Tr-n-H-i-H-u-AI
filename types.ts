export enum EditMode {
  Generate = 'GENERATE',
  GenerativeFill = 'GENERATIVE_FILL',
  Expand = 'EXPAND',
  RemoveBackground = 'REMOVE_BACKGROUND',
  ChangeBackground = 'CHANGE_BACKGROUND',
  FaceSwap = 'FACE_SWAP',
  Sharpen = 'SHARPEN',
  Beautify = 'BEAUTIFY',
  Filter = 'FILTER',
  Resize = 'RESIZE',
  ConvertFormat = 'CONVERT_FORMAT',
  BatchWatermark = 'BATCH_WATERMARK',
  CreatePDF = 'CREATE_PDF',
  CompressPDF = 'COMPRESS_PDF',
  ExtractPdfImages = 'EXTRACT_PDF_IMAGES',
  RemoveWatermarkImage = 'REMOVE_WATERMARK_IMAGE',
  GenerateVideo = 'GENERATE_VIDEO',
  GenerateVideoFromScript = 'GENERATE_VIDEO_FROM_SCRIPT',
  RemoveWatermarkVideo = 'REMOVE_WATERMARK_VIDEO',
  CompositeImages = 'COMPOSITE_IMAGES',

  // New Links
  PhotoshopOnline = 'PHOTOSHOP_ONLINE',
  QRCodeGenerator = 'QR_CODE_GENERATOR',

  // New Chats
  GeminiChat = 'GEMINI_CHAT',
}

// FIX: Centralized the global type declaration for `window.aistudio` here to resolve declaration conflicts across multiple component files.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        // FIX: Made `aistudio` optional to resolve the declaration conflict. This aligns with its usage, where it's checked for existence before use.
        aistudio?: AIStudio;
    }
}