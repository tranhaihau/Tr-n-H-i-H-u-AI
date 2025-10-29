import React from 'react';
import { EditMode } from './types';

const WandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 14v-2m-7.5-1.5L6 13m0 0L4.5 14.5M15 20v2m0-14v2m7.5 1.5L18 13m0 0l1.5 1.5M2 15h2m14 0h2M7 11.5L5.5 10m0 0L7 8.5M17 11.5L18.5 10m0 0L17 8.5"/></svg>
);
const EraseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 5.5l-1.5-1.5-11 11L5 16.5l11-11zm-1.5-1.5L13 2.5 2.5 13 4 14.5l10.5-10.5zM9 15l-1.5 1.5L12 21l3-3-4-4v0z"/><path d="M15 9l3-3"/></svg>
);
const UpscaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/><path d="M5 12V5h7"/><path d="M19 12v7h-7"/></svg>
);
const ExpandIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21v-4a2 2 0 0 1 2-2h4"/><path d="M21 3v4a2 2 0 0 1-2 2h-4"/><path d="M21 17v4a2 2 0 0 1-2 2h-4"/><path d="M3 7V3a2 2 0 0 1 2-2h4"/></svg>
);
const ScissorsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>
);
const ReplaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4z"/><path d="M22 12c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8"/><path d="M18 12c0-3.31-2.69-6-6-6"/></svg>
);
const FaceSwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10h3M7 10h3"/><path d="M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M18.6 15.5c-1.3-1.2-2.3-2.6-3.1-4.1"/><path d="M5.4 15.5c1.3-1.2 2.3-2.6 3.1-4.1"/><path d="M12 2a10 10 0 0 0-10 10c0 4.4 2.9 8.1 6.8 9.5"/><path d="M12 22a10 10 0 0 0 10-10c0-4.4-2.9-8.1-6.8-9.5"/></svg>
);
const SharpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const BeautifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9 9l-7 2.5 7 2.5 3 7 3-7 7-2.5-7-2.5L12 2z"/><path d="M19 12l-2 2 2 2-2 2"/></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/></svg>;
const ResizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3L3 21"/><path d="M12 3H3v9"/><path d="M21 12v9h-9"/></svg>;
const ConvertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4M4 12l6-6M4 12l6 6"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>;


// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
export const TOOLS: Record<EditMode, { name: string; icon: React.ReactElement; description: string; defaultPrompt?: string, promptPlaceholder?: string }> = {
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
    [EditMode.Upscale]: {
      name: "Nâng Cấp Ảnh",
      icon: <UpscaleIcon />,
      description: "Tăng độ phân giải và chi tiết của ảnh.",
      defaultPrompt: "Upscale this image, enhance details and resolution, making it clearer and sharper.",
      promptPlaceholder: "Optional: specify focus areas for upscaling"
    },
    [EditMode.Sharpen]: {
      name: "Làm Rõ Nét",
      icon: <SharpenIcon />,
      description: "Tăng độ sắc nét và làm nổi bật các chi tiết trong ảnh.",
      defaultPrompt: "Sharpen this image, enhancing fine details and making edges crisper without introducing artifacts.",
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
      defaultPrompt: "Expand the canvas of this image, intelligently filling in the new areas to match the existing content.",
      promptPlaceholder: "Optional: describe what to add in the expanded areas"
    },
    [EditMode.RemoveBackground]: {
      name: "Tách Nền",
      icon: <ScissorsIcon />,
      description: "Tự động tách nền khỏi chủ thể chính.",
      defaultPrompt: "Remove the background from this image, leaving only the main subject with a transparent background.",
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
};
