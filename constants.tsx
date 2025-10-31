import React from 'react';
import { EditMode } from './types';

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2m-7.5-1.5L6 13m0 0L4.5 14.5M15 20v2m0-14v2m7.5 1.5L18 13m0 0l1.5 1.5M2 15h2m14 0h2M7 11.5L5.5 10m0 0L7 8.5M17 11.5L18.5 10m0 0L17 8.5"/></svg>
);
const EraseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 5.5l-1.5-1.5-11 11L5 16.5l11-11zm-1.5-1.5L13 2.5 2.5 13 4 14.5l10.5-10.5zM9 15l-1.5 1.5L12 21l3-3-4-4v0z"/><path d="M15 9l3-3"/></svg>
);
const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21v-4a2 2 0 0 1 2-2h4"/><path d="M21 3v4a2 2 0 0 1-2 2h-4"/><path d="M21 17v4a2 2 0 0 1-2 2h-4"/><path d="M3 7V3a2 2 0 0 1 2-2h4"/></svg>
);
const ScissorsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>
);
const ReplaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12c0-2.21-1.79-4-4-4s-4 1.79-4-4 1.79 4 4 4 4-1.79 4-4z"/><path d="M22 12c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8"/><path d="M18 12c0-3.31-2.69-6-6-6"/></svg>
);
const FaceSwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10h3M7 10h3"/><path d="M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M18.6 15.5c-1.3-1.2-2.3-2.6-3.1-4.1"/><path d="M5.4 15.5c1.3-1.2 2.3-2.6 3.1-4.1"/><path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.1 6.8 9.5"/><path d="M12 22a10 10 0 0 0 10-10c0-4.4-2.9-8.1-6.8-9.5"/></svg>
);
const CompositeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M8 21h11a2 2 0 0 0 2-2V8"></path>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="M21 15l-5-5L8 21"></path>
    </svg>
);
const SharpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const BeautifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9 9l-7 2.5 7 2.5 3 7 3-7 7-2.5-7-2.5L12 2z"/><path d="M19 12l-2 2 2 2-2 2"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/></svg>;
const ResizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3L3 21"/><path d="M12 3H3v9"/><path d="M21 12v9h-9"/></svg>;
const ConvertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4M4 12l6-6M4 12l6 6"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;
const WatermarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
        <path d="M2 12v8a2 2 0 0 0 2 2h10" />
        <path d="M15 14c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
        <path d="M15 16.5V16" />
        <path d="M15 20v-.5" />
    </svg>
);
const CreatePdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
);
const CompressPdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 13.5V12h1.5a1.5 1.5 0 1 1 0 3H9" />
        <path d="M15.5 12H14v6h1.5" />
        <path d="M12.5 18H14" />
        <path d="M10 18v-6" />
        <path d="M8 12h2" />
    </svg>
);
const ExtractPdfImagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <rect x="8" y="12" width="8" height="6" rx="1" />
        <path d="m10 14.5 1.5 1.5 3-3" />
    </svg>
);
const WatermarkOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" />
        <path d="M2 12v8a2 2 0 0 0 2 2h10" />
        <circle cx="17" cy="17" r="4" />
        <line x1="14" y1="20" x2="20" y2="14" />
    </svg>
);
const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 5.25a2.25 2.25 0 0 0-2.25-2.25H4.25A2.25 2.25 0 0 0 2 5.25v13.5A2.25 2.25 0 0 0 4.25 21h15.5A2.25 2.25 0 0 0 22 18.75V5.25z"></path>
        <path d="m10 15.25 5.5-3.25L10 8.75v6.5z"></path>
        <path d="M7 3v18"></path>
        <path d="M17 3v18"></path>
    </svg>
);
const ScriptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
const VideoCleanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 5.25a2.25 2.25 0 0 0-2.25-2.25H4.25A2.25 2.25 0 0 0 2 5.25v13.5A2.25 2.25 0 0 0 4.25 21h15.5A2.25 2.25 0 0 0 22 18.75V5.25z"></path>
        <path d="m10 15.25 5.5-3.25L10 8.75v6.5z"></path>
        <path d="m15.5 3.5-1.5-1.5-3 3-1.5-1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5-1.5-1.5z"></path>
    </svg>
);
const PhotoshopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);
const QRIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="14" y1="14" x2="14" y2="14.01"></line><line x1="17.5" y1="14" x2="17.5" y2="14.01"></line><line x1="21" y1="14" x2="21" y2="14.01"></line><line x1="14" y1="17.5" x2="14" y2="17.5.01"></line><line x1="17.5" y1="17.5" x2="17.5" y2="17.5.01"></line><line x1="21" y1="17.5" x2="21" y2="17.5.01"></line><line x1="14" y1="21" x2="14" y2="21.01"></line><line x1="17.5" y1="21" x2="17.5" y2="21.01"></line><line x1="21" y1="21" x2="21" y2="21.01"></line></svg>
);
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);


type ToolDetails = { name: string; icon: React.ReactElement; description: string; defaultPrompt?: string, promptPlaceholder?: string };

export const MENU_STRUCTURE: Record<string, { name: string; tools: EditMode[] }> = {
    IMAGE: {
        name: 'Ảnh',
        tools: [
            EditMode.Generate,
            EditMode.GenerativeFill,
            EditMode.CompositeImages,
            EditMode.Sharpen,
            EditMode.Beautify,
            EditMode.Expand,
            EditMode.RemoveBackground,
            EditMode.ChangeBackground,
            EditMode.FaceSwap,
            EditMode.RemoveWatermarkImage,
            EditMode.Filter,
            EditMode.Resize,
            EditMode.ConvertFormat,
            EditMode.BatchWatermark,
        ]
    },
    PDF: {
        name: 'PDF',
        tools: [
            EditMode.CreatePDF,
            EditMode.CompressPDF,
            EditMode.ExtractPdfImages,
        ]
    },
    VIDEO: {
        name: 'Video',
        tools: [
            EditMode.GenerateVideo,
            EditMode.GenerateVideoFromScript,
            EditMode.RemoveWatermarkVideo,
        ]
    },
    AI_CHAT: {
        name: 'AI Chat',
        tools: [
            EditMode.GeminiChat,
        ]
    },
    TOOLS: {
        name: 'Công Cụ',
        tools: [
            EditMode.PhotoshopOnline,
            EditMode.QRCodeGenerator,
        ]
    }
};

export const TOOLS: Record<EditMode, ToolDetails> = {
    [EditMode.Generate]: {
      name: "Tạo Ảnh",
      icon: <WandIcon />,
      description: "Tạo ảnh mới từ mô tả văn bản, có thể đính kèm ảnh tham khảo.",
      promptPlaceholder: "Một robot đang cầm một chiếc ván trượt màu đỏ..."
    },
    [EditMode.GenerativeFill]: {
      name: "Chỉnh Sửa Vùng Chọn",
      icon: <EraseIcon />,
      description: "Vẽ một hộp xung quanh đối tượng, sau đó mô tả thay đổi bạn muốn.",
      defaultPrompt: "In the provided image, for the region defined by the semi-transparent red box, perform the following action: {user_prompt}. Fill the area naturally and return the entire image without the red box.",
      promptPlaceholder: "thêm một con bướm đang bay"
    },
    [EditMode.Sharpen]: {
      name: "Cải Thiện Ảnh",
      icon: <SharpenIcon />,
      description: "Cải thiện chi tiết ảnh, làm nét ảnh, mà không thay đổi kích thước ảnh bàn đầu.",
      defaultPrompt: "Enhance the details and sharpness of this image. Improve overall quality and clarity without changing the original dimensions.",
    },
    [EditMode.Beautify]: {
      name: "Làm Đẹp",
      icon: <BeautifyIcon />,
      description: "Tinh chỉnh và làm đẹp chân dung: mịn da, điều chỉnh đường nét mặt.",
      defaultPrompt: "Beautify the face in this image with the following adjustments: {user_prompt}. Maintain a natural look.",
    },
    [EditMode.Expand]: {
      name: "Mở Rộng Ảnh",
      icon: <ExpandIcon />,
      description: "Mở rộng khung hình và để AI tự động vẽ thêm.",
      defaultPrompt: "This image contains transparent areas. Intelligently fill in these transparent areas to match the existing content, creating a seamless, larger picture. The final output should not have any transparent parts.",
      promptPlaceholder: "Optional: describe what to add in the expanded areas"
    },
    [EditMode.RemoveBackground]: {
      name: "Tách Nền",
      icon: <ScissorsIcon />,
      description: "Tự động tách nền khỏi chủ thể, kết quả là ảnh PNG không có nền.",
      defaultPrompt: "Isolate the main subject in this image. Remove the background entirely. The resulting image must have a transparent background. Output a PNG file with a true alpha channel. IMPORTANT: Do not replace the background with white or any other solid color.",
      promptPlaceholder: "Optional: describe the main subject if needed"
    },
    [EditMode.ChangeBackground]: {
      name: "Thay Nền",
      icon: <ReplaceIcon />,
      description: "Thay đổi nền của ảnh bằng một nền mới.",
      defaultPrompt: "Change the background of this image to: ",
      promptPlaceholder: "một bãi biển đầy nắng với cát trắng"
    },
    [EditMode.FaceSwap]: {
      name: "Gán Ghép Gương Mặt",
      icon: <FaceSwapIcon />,
      description: "Tải lên ảnh nguồn (chứa gương mặt) và ảnh đích, AI sẽ thực hiện gán ghép.",
      defaultPrompt: "Take the face from the first image (source face) and seamlessly swap it onto the most prominent person in the second image (target image). Preserve the lighting, skin tone, and style of the target image for a realistic result.",
    },
    [EditMode.CompositeImages]: {
      name: "Ghép Ảnh",
      icon: <CompositeIcon />,
      description: "Tự động ghép chủ thể từ ảnh 1 vào ảnh 2 một cách tự nhiên.",
      defaultPrompt: "Take the primary subject from the first image and realistically composite it into the second image. Pay close attention to lighting, shadows, scale, and perspective to ensure the final image looks natural and coherent.",
    },
    [EditMode.Filter]: {
        name: "Bộ Lọc Màu",
        icon: <FilterIcon />,
        description: "Áp dụng các bộ lọc màu nghệ thuật cho ảnh của bạn.",
    },
    [EditMode.Resize]: {
        name: "Thay Đổi Kích Thước",
        icon: <ResizeIcon />,
        description: "Thay đổi kích thước chiều rộng và chiều cao của ảnh.",
    },
    [EditMode.ConvertFormat]: {
        name: "Đổi Định Dạng",
        icon: <ConvertIcon />,
        description: "Chuyển đổi định dạng ảnh sang JPG hoặc PNG.",
    },
    [EditMode.BatchWatermark]: {
        name: "Gắn Watermark Hàng Loạt",
        icon: <WatermarkIcon />,
        description: "Thêm logo hoặc chữ ký vào nhiều ảnh cùng lúc (tối đa 20 ảnh).",
    },
    [EditMode.CreatePDF]: {
        name: "Tạo File PDF",
        icon: <CreatePdfIcon />,
        description: "Tạo một file PDF từ nhiều ảnh. Có thể sắp xếp lại thứ tự ảnh.",
    },
    [EditMode.CompressPDF]: {
        name: "Nén File PDF",
        icon: <CompressPdfIcon />,
        description: "Giảm dung lượng file PDF bằng cách nén hình ảnh bên trong.",
    },
    [EditMode.ExtractPdfImages]: {
        name: "Trích xuất ảnh PDF",
        icon: <ExtractPdfImagesIcon />,
        description: "Tự động trích xuất tất cả hình ảnh có trong một file PDF.",
    },
    [EditMode.RemoveWatermarkImage]: {
      name: "Xóa Watermark Ảnh",
      icon: <WatermarkOffIcon />,
      description: "Tự động phát hiện và xóa watermark khỏi ảnh của bạn.",
      defaultPrompt: "This image is partially obscured by a logo or text. Please reconstruct the obscured parts of the image to show what is behind the overlay. The goal is to restore the image to its original state, making it look as if the overlay was never there.",
    },
    [EditMode.GenerateVideo]: {
      name: "Tạo Video AI",
      icon: <VideoIcon />,
      description: "Tạo video từ mô tả văn bản, có thể đính kèm ảnh tham khảo. Quá trình này có thể mất vài phút.",
      promptPlaceholder: "Một con mèo đáng yêu đang chơi với cuộn len...",
    },
    [EditMode.GenerateVideoFromScript]: {
      name: "Tạo Video Từ Kịch Bản",
      icon: <ScriptIcon />,
      description: "Phân tích kịch bản thành nhiều cảnh và tạo video cho từng cảnh.",
      promptPlaceholder: "Một con mèo đáng yêu đang chơi với cuộn len...",
    },
    [EditMode.RemoveWatermarkVideo]: {
      name: "Xóa Watermark Video",
      icon: <VideoCleanIcon />,
      description: "Xóa watermark khỏi video. Quá trình này xử lý từng khung hình, có thể rất chậm và sẽ loại bỏ âm thanh.",
      defaultPrompt: "This image is partially obscured by a logo or text. Please reconstruct the obscured parts of the image to show what is behind the overlay. The goal is to restore the image to its original state, making it look as if the overlay was never there.",
    },
    [EditMode.PhotoshopOnline]: {
        name: "Photoshop Online",
        icon: <PhotoshopIcon />,
        description: "Trình chỉnh sửa ảnh nâng cao tương tự Photoshop, chạy trực tiếp trên trình duyệt.",
    },
    [EditMode.QRCodeGenerator]: {
        name: "Tạo Mã QR",
        icon: <QRIcon />,
        description: "Tạo mã QR từ văn bản hoặc liên kết một cách nhanh chóng.",
    },
    [EditMode.GeminiChat]: {
        name: "Trò chuyện với AI",
        icon: <ChatIcon />,
        description: "Trò chuyện với mô hình AI Gemini của Google.",
    },
};