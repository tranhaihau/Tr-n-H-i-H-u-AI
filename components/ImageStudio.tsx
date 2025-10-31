import React, { useState, useRef, useEffect, useCallback } from 'react';
import { editImage, generateImage, faceSwap, compositeImages } from '../services/geminiService';
import { EditMode } from '../types';
import { TOOLS, MENU_STRUCTURE } from '../constants';
import FileUpload from './common/FileUpload';
import MultiFileUpload from './common/MultiFileUpload';
import Spinner from './common/Spinner';
import InteractiveImage, { Selection } from './common/InteractiveImage';
import OutpaintingCanvas, { ExpansionData } from './common/OutpaintingCanvas';

declare const JSZip: any;

type Format = 'image/jpeg' | 'image/png';

const FILTERS = [
    { name: 'None', style: 'none' }, { name: 'Clarendon', style: 'contrast(1.2) saturate(1.35)' }, { name: 'Gingham', style: 'brightness(1.05) hue-rotate(-10deg)' }, { name: 'Moon', style: 'grayscale(1) contrast(1.1) brightness(1.1)' }, { name: 'Lark', style: 'contrast(.9) brightness(1.1) saturate(1.1)' }, { name: 'Reyes', style: 'sepia(.22) brightness(1.1) contrast(.85) saturate(.75)' }, { name: 'Juno', style: 'contrast(1.1) brightness(1.05) saturate(1.4)' }, { name: 'Slumber', style: 'saturate(0.66) brightness(1.05)'}, { name: 'Crema', style: 'sepia(.5) contrast(1.1) brightness(1.1)'}, { name: 'Ludwig', style: 'brightness(1.05) contrast(1.05) saturate(0.1)'}, { name: 'Aden', style: 'hue-rotate(-20deg) contrast(.9) saturate(.85) brightness(1.2)'}, { name: 'Perpetua', style: 'contrast(1.1) brightness(1.2) saturate(1.1)'}, { name: '1977', style: 'contrast(1.1) brightness(1.1) saturate(1.3)' }, { name: 'Amaro', style: 'hue-rotate(-10deg) contrast(0.9) brightness(1.1) saturate(1.5)' }, { name: 'Brannan', style: 'sepia(0.5) contrast(1.4)' }, { name: 'Earlybird', style: 'contrast(0.9) sepia(0.2)' }, { name: 'Hefe', style: 'contrast(1.1) saturate(1.1) brightness(1.05) sepia(0.1)' }, { name: 'Hudson', style: 'brightness(1.2) contrast(0.9) saturate(1.1)' }, { name: 'Inkwell', style: 'sepia(0.3) contrast(1.1) brightness(1.1) grayscale(1)' }, { name: 'Kelvin', style: 'sepia(0.4) contrast(1.5) brightness(1.1)' }, { name: 'Lo-Fi', style: 'saturate(1.1) contrast(1.5)' }, { name: 'Nashville', style: 'sepia(0.2) contrast(1.5) brightness(0.9) hue-rotate(-15deg)' }, { name: 'Rise', style: 'brightness(1.05) sepia(0.25) contrast(0.9) saturate(0.9)' }, { name: 'Sierra', style: 'contrast(0.9) saturate(1.1) brightness(1.1) sepia(0.05)' }, { name: 'Sutro', style: 'brightness(0.75) contrast(1.1) saturate(1.4) hue-rotate(-10deg) sepia(0.5)' }, { name: 'Toaster', style: 'contrast(1.5) brightness(0.9) sepia(0.1)' }, { name: 'Valencia', style: 'contrast(1.1) brightness(1.1) sepia(0.08)' }, { name: 'Walden', style: 'brightness(1.1) hue-rotate(-10deg) sepia(0.3) saturate(1.6)' }, { name: 'Willow', style: 'grayscale(0.5) contrast(0.95) brightness(0.9)' }, { name: 'X-Pro II', style: 'sepia(0.3) contrast(1.5) brightness(0.75) saturate(1.2) hue-rotate(-5deg)' }, { name: 'Mayfair', style: 'contrast(1.1) saturate(1.1) brightness(1.05)' }, { name: 'Stinson', style: 'contrast(0.75) saturate(0.85) brightness(1.15)' },
];

interface ImageStudioProps {
  initialMode: EditMode;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ initialMode }) => {
    const [activeTool, setActiveTool] = useState<EditMode>(initialMode);
    
    // Global state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    
    // Image state
    const [file, setFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

    // Tool-specific state
    const [selection, setSelection] = useState<Selection | null>(null);
    const [expansionData, setExpansionData] = useState<ExpansionData | null>(null);
    const [beautifyOptions, setBeautifyOptions] = useState({ smoothSkin: 50, enlargeEyes: 10, vLineFace: false });
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [compositeImage1, setCompositeImage1] = useState<File | null>(null);
    const [compositeImage2, setCompositeImage2] = useState<File | null>(null);
    const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
    const [outputFormat, setOutputFormat] = useState<Format>('image/jpeg');
    const [jpegQuality, setJpegQuality] = useState<number>(0.92);
    const [selectedFilter, setSelectedFilter] = useState<string>('none');
    
    // Refs
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // This function resets state when the tool changes to prevent side effects
    const resetStateForNewTool = () => {
        setIsLoading(false);
        setError(null);
        setPrompt('');
        setFile(null);
        setOriginalImageUrl(null);
        setProcessedImageUrl(null);
        setSelection(null);
        setExpansionData(null);
        setSourceFile(null);
        setTargetFile(null);
        setCompositeImage1(null);
        setCompositeImage2(null);
        setOriginalSize(null);
        setWidth(0);
        setHeight(0);
        setSelectedFilter('none');
        setBeautifyOptions({ smoothSkin: 50, enlargeEyes: 10, vLineFace: false });
    };

    useEffect(() => {
        setActiveTool(initialMode);
        resetStateForNewTool();
    }, [initialMode]);

    const handleToolChange = (mode: EditMode) => {
        if (activeTool === mode) return;
        setActiveTool(mode);
        resetStateForNewTool();
    };

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setProcessedImageUrl(null); 
        setSelection(null);
        setExpansionData(null);
        setSelectedFilter('none');
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setOriginalImageUrl(url);
            const img = new Image();
            img.onload = () => {
              setOriginalSize({ width: img.width, height: img.height });
              setWidth(img.width);
              setHeight(img.height);
            };
            img.src = url;
        } else {
            setOriginalImageUrl(null);
            setOriginalSize(null);
            setWidth(0);
            setHeight(0);
        }
    };
    
    const isApiTool = !([EditMode.Resize, EditMode.ConvertFormat, EditMode.Filter, EditMode.BatchWatermark].includes(activeTool));

    const handleSubmit = async () => {
        if (!isApiTool) return; // Client-side tools have their own handlers

        const toolConfig = TOOLS[activeTool];
        setIsLoading(true);
        setError(null);
        setProcessedImageUrl(null);

        try {
            if (activeTool === EditMode.Generate) {
                if (!prompt) throw new Error("Vui lòng nhập mô tả.");
                const imageData = await generateImage(prompt, file);
                setProcessedImageUrl(`data:image/png;base64,${imageData}`);
            } else if (activeTool === EditMode.FaceSwap) {
                if (!sourceFile || !targetFile) throw new Error("Vui lòng tải lên cả hai ảnh.");
                const imageData = await faceSwap(sourceFile, targetFile, toolConfig.defaultPrompt!);
                setProcessedImageUrl(`data:image/png;base64,${imageData}`);
            } else if (activeTool === EditMode.CompositeImages) {
                if (!compositeImage1 || !compositeImage2) throw new Error("Vui lòng tải lên cả hai ảnh.");
                const imageData = await compositeImages(compositeImage1, compositeImage2, toolConfig.defaultPrompt!);
                setProcessedImageUrl(`data:image/png;base64,${imageData}`);
            } else {
                if (!file) throw new Error("Vui lòng tải ảnh lên.");
                
                let imageFileToSend: File = file;
                let finalPrompt: string;
                
                // Construct prompt and preprocess image if needed
                if (activeTool === EditMode.GenerativeFill) {
                    if (!prompt) throw new Error("Vui lòng nhập mô tả cho vùng cần chỉnh sửa.");
                    if (!selection) throw new Error("Vui lòng vẽ một hộp xung quanh khu vực cần chỉnh sửa.");
                    finalPrompt = toolConfig.defaultPrompt!.replace('{user_prompt}', prompt);
                    imageFileToSend = await getCanvasBlobAsFile(file, 'fill');
                } else if (activeTool === EditMode.Expand) {
                    if (!expansionData || (expansionData.newWidth === expansionData.imageWidth && expansionData.newHeight === expansionData.imageHeight)) {
                        throw new Error("Vui lòng kéo các cạnh để mở rộng ảnh.");
                    }
                    finalPrompt = `${toolConfig.defaultPrompt || ''}${prompt}`;
                    imageFileToSend = await getCanvasBlobAsFile(file, 'expand');
                } else if (activeTool === EditMode.Beautify) {
                    let userPrompt = '';
                    if (beautifyOptions.smoothSkin > 0) userPrompt += `smooth the skin to ${beautifyOptions.smoothSkin}%, preserving natural texture. `;
                    if (beautifyOptions.enlargeEyes > 0) userPrompt += `slightly enlarge the eyes by about ${beautifyOptions.enlargeEyes}%. `;
                    if (beautifyOptions.vLineFace) userPrompt += `create a subtle V-line jaw shape. `;
                    finalPrompt = toolConfig.defaultPrompt!.replace('{user_prompt}', userPrompt || "subtle enhancements for a natural look");
                } else {
                    finalPrompt = `${toolConfig.defaultPrompt || ''}${prompt}`;
                }

                const imageData = await editImage(imageFileToSend, finalPrompt);
                setProcessedImageUrl(`data:image/png;base64,${imageData}`);
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getCanvasBlobAsFile = async (originalFile: File, mode: 'fill' | 'expand'): Promise<File> => {
        const image = new Image();
        image.src = originalImageUrl!;
        await new Promise(resolve => { image.onload = resolve; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        
        if (mode === 'fill' && selection && imageContainerRef.current) {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);
            const scaleX = image.naturalWidth / imageContainerRef.current.clientWidth;
            const scaleY = image.naturalHeight / imageContainerRef.current.clientHeight;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Red box for the model
            ctx.fillRect(selection.x * scaleX, selection.y * scaleY, selection.width * scaleX, selection.height * scaleY);
        } else if (mode === 'expand' && expansionData) {
            canvas.width = expansionData.newWidth;
            canvas.height = expansionData.newHeight;
            // Draw image inside the expanded transparent canvas
            ctx.drawImage(image, expansionData.imageX, expansionData.imageY, expansionData.imageWidth, expansionData.imageHeight);
        }

        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error("Could not convert canvas to blob.");
        return new File([blob], originalFile.name, { type: 'image/png' });
    }

    // Client-side tool logic
    const handleResize = useCallback(() => {
      if (!originalImageUrl || width <= 0 || height <= 0) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setProcessedImageUrl(canvas.toDataURL(file?.type || 'image/png'));
        }
      };
      img.src = originalImageUrl;
    }, [originalImageUrl, width, height, file]);
    
    useEffect(() => { 
        if(activeTool === EditMode.Resize && originalImageUrl) { 
            handleResize(); 
        } 
    }, [width, height, originalImageUrl, handleResize, activeTool]);


    const handleConvertAndDownload = useCallback(() => {
        if (!originalImageUrl || !file) return;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL(outputFormat, outputFormat === 'image/jpeg' ? jpegQuality : undefined);
                const link = document.createElement('a');
                const extension = outputFormat === 'image/jpeg' ? 'jpg' : 'png';
                const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                link.download = `${fileName}-converted.${extension}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
        img.src = originalImageUrl;
    }, [originalImageUrl, file, outputFormat, jpegQuality]);
    
     const handleFilterDownload = useCallback(() => {
        if (!originalImageUrl || !file) return;
        const img = new Image();
        img.crossOrigin = 'anonymous'; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.filter = selectedFilter;
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL(file.type);
                const link = document.createElement('a');
                const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const filterName = FILTERS.find(f => f.style === selectedFilter)?.name.toLowerCase().replace(' ', '-') || 'filtered';
                const extension = file.type === 'image/jpeg' ? 'jpg' : 'png';
                link.download = `${fileName}-${filterName}.${extension}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
        img.src = originalImageUrl;
    }, [originalImageUrl, file, selectedFilter]);

    // UI Rendering
    const renderControls = () => {
        const toolConfig = TOOLS[activeTool];
        const isPromptVisible = [EditMode.Generate, EditMode.ChangeBackground, EditMode.GenerativeFill, EditMode.Expand].includes(activeTool);
        
        return (
            <div className="flex-grow flex flex-col gap-2">
                 {isPromptVisible && (
                     <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={toolConfig.promptPlaceholder} className="w-full flex-grow p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-text-primary resize-none" rows={3}/>
                 )}

                 {activeTool === EditMode.Beautify && (
                    <div className="bg-base-200 p-3 rounded-lg w-full space-y-2">
                        <div><label className="block text-xs font-medium text-text-secondary">Làm Mịn Da: {beautifyOptions.smoothSkin}%</label><input type="range" min="0" max="100" value={beautifyOptions.smoothSkin} onChange={(e) => setBeautifyOptions({...beautifyOptions, smoothSkin: parseInt(e.target.value)})} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"/></div>
                        <div><label className="block text-xs font-medium text-text-secondary">Làm To Mắt: {beautifyOptions.enlargeEyes}%</label><input type="range" min="0" max="100" value={beautifyOptions.enlargeEyes} onChange={(e) => setBeautifyOptions({...beautifyOptions, enlargeEyes: parseInt(e.target.value)})} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"/></div>
                        <div className="flex items-center justify-between pt-1"><label className="text-sm font-medium text-text-secondary">Mặt V-line</label><input type="checkbox" checked={beautifyOptions.vLineFace} onChange={(e) => setBeautifyOptions({...beautifyOptions, vLineFace: e.target.checked})} className="toggle toggle-primary toggle-sm"/></div>
                    </div>
                 )}
                 
                 {activeTool === EditMode.Resize && (
                     <div className="flex-grow flex flex-col gap-2 bg-base-100 p-3 rounded-lg border border-base-300">
                        <div className="flex items-center gap-2">
                            <div className='flex-1'><label htmlFor="width" className="block text-sm font-medium text-text-secondary">Rộng (px)</label><input type="number" id="width" value={width} onChange={(e) => { const newWidth = parseInt(e.target.value) || 0; setWidth(newWidth); if (lockAspectRatio && originalSize && originalSize.width > 0) setHeight(Math.round(newWidth * (originalSize.height / originalSize.width))); }} className="w-full p-2 bg-base-200 border border-base-300 rounded-lg"/></div>
                            <button onClick={() => setLockAspectRatio(!lockAspectRatio)} className="mt-6 p-2 bg-base-200 rounded-lg">{lockAspectRatio ? '🔒' : '🔓'}</button>
                            <div className='flex-1'><label htmlFor="height" className="block text-sm font-medium text-text-secondary">Cao (px)</label><input type="number" id="height" value={height} onChange={(e) => { const newHeight = parseInt(e.target.value) || 0; setHeight(newHeight); if (lockAspectRatio && originalSize && originalSize.height > 0) setWidth(Math.round(newHeight * (originalSize.width / originalSize.height))); }} className="w-full p-2 bg-base-200 border border-base-300 rounded-lg"/></div>
                        </div>
                        {originalSize && <p className="text-xs text-center text-text-secondary">Gốc: {originalSize.width} x {originalSize.height} px</p>}
                     </div>
                 )}
                 
                 {activeTool === EditMode.ConvertFormat && (
                     <div className="flex-grow flex flex-col gap-2 bg-base-100 p-3 rounded-lg border border-base-300 justify-center">
                        <div className="flex items-center justify-center gap-4"><label className="cursor-pointer"><input type="radio" name="format" value="image/jpeg" checked={outputFormat === 'image/jpeg'} onChange={() => setOutputFormat('image/jpeg')} className="radio radio-primary radio-sm" /><span className="ml-2 text-text-primary">JPG</span></label><label className="cursor-pointer"><input type="radio" name="format" value="image/png" checked={outputFormat === 'image/png'} onChange={() => setOutputFormat('image/png')} className="radio radio-primary radio-sm" /><span className="ml-2 text-text-primary">PNG</span></label></div>
                        {outputFormat === 'image/jpeg' && ( <div> <label className="block text-sm font-medium text-text-secondary">Chất lượng: {Math.round(jpegQuality * 100)}%</label> <input type="range" min="0.1" max="1" step="0.01" value={jpegQuality} onChange={(e) => setJpegQuality(parseFloat(e.target.value))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer" /> </div>)}
                        <button onClick={handleConvertAndDownload} disabled={!file} className="w-full px-4 py-2 mt-1 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200">Chuyển đổi & Tải</button>
                    </div>
                 )}
                 
                 {isApiTool && <button onClick={handleSubmit} disabled={isLoading} className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center mt-auto">{isLoading && <Spinner />}{isLoading ? 'Đang xử lý...' : toolConfig.name}</button>}
            </div>
        )
    };
    
    const renderDisplayArea = () => {
        const twoPanelModes = [EditMode.Sharpen, EditMode.Beautify, EditMode.RemoveBackground, EditMode.ChangeBackground, EditMode.RemoveWatermarkImage, EditMode.GenerativeFill, EditMode.Expand, EditMode.Resize];
        const singlePanelModes = [EditMode.Generate, EditMode.FaceSwap, EditMode.CompositeImages];

        const OriginalImageViewer = () => {
            if (!originalImageUrl) return <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>;
            if (activeTool === EditMode.GenerativeFill) return <InteractiveImage src={originalImageUrl} onSelectionChange={setSelection} />;
            if (activeTool === EditMode.Expand) return <OutpaintingCanvas src={originalImageUrl} onExpansionChange={setExpansionData} />;
            return <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />;
        };

        const ProcessedImageViewer = () => {
             if (isLoading && !error) return <div className="text-center"><Spinner large /><p className="mt-4 text-text-secondary">AI đang xử lý, vui lòng đợi...</p></div>;
             if (processedImageUrl) return (
                 <div className="relative group">
                    <img src={processedImageUrl} alt="Processed" className="max-w-full max-h-[60vh] rounded-lg shadow-xl" />
                    <a href={processedImageUrl} download={`${activeTool.toLowerCase()}-result.png`} className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">Tải xuống</a>
                 </div>
             );
             return <div className="text-text-secondary">Kết quả sẽ hiển thị ở đây</div>
        };

        if (twoPanelModes.includes(activeTool)) return (
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                <div ref={imageContainerRef} className="bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]"><h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh Gốc</h3><OriginalImageViewer /></div>
                <div className={`bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh] ${activeTool === EditMode.RemoveBackground ? 'checkerboard-bg' : ''}`}><h3 className="text-lg font-semibold text-text-secondary mb-4">Kết Quả</h3><ProcessedImageViewer /></div>
            </div>
        );
        
        if (singlePanelModes.includes(activeTool)) return (
             <div className="flex-grow mt-4 flex items-center justify-center bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[50vh]">
                {isLoading && !error ? <div className="text-center"><Spinner large /><p className="mt-4 text-text-secondary">AI đang sáng tạo...</p></div> : null}
                {processedImageUrl ? <ProcessedImageViewer /> : null}
                {!processedImageUrl && !isLoading && <div className="text-text-secondary">Kết quả sẽ hiển thị ở đây</div>}
             </div>
        );

        if (activeTool === EditMode.Filter) return (
            <div className="flex-grow flex flex-col mt-4">
                <div className="flex-grow bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh] mb-4">
                  {originalImageUrl ? ( <div className="relative group"><img src={originalImageUrl} alt="Preview" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" style={{ filter: selectedFilter }} /><button onClick={handleFilterDownload} disabled={!file} className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100">Tải xuống</button></div>) : <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>}
                </div>
                <div className="flex-shrink-0 bg-base-100 p-2 rounded-lg"><div className="flex overflow-x-auto space-x-3 p-2">{FILTERS.map(filter => (<div key={filter.name} className="flex-shrink-0 text-center cursor-pointer" onClick={() => setSelectedFilter(filter.style)}><div className={`w-24 h-24 rounded-lg border-2 ${selectedFilter === filter.style ? 'border-primary' : 'border-transparent'}`}>{originalImageUrl ? <img src={originalImageUrl} alt={filter.name} className="w-full h-full object-cover rounded-md" style={{ filter: filter.style }} /> : <div className="w-full h-full bg-base-200 rounded-md"></div>}</div><p className="mt-1 text-xs">{filter.name}</p></div>))}</div></div>
            </div>
        );
        
         if (activeTool === EditMode.ConvertFormat) return (
             <div className="flex-grow mt-4 bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]">
              {originalImageUrl ? (<img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />) : (<div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>)}
            </div>
         );
         
         if(activeTool === EditMode.BatchWatermark) {
            // Batch watermark has a unique layout and is too complex to fit the standard mold.
            // It will be handled in a future refactor or kept separate.
            return <div className="flex-grow mt-4 p-4 text-center"><BatchWatermarkEditor /></div>
         }

        return null;
    };

    const isSingleFileUpload = ![EditMode.FaceSwap, EditMode.CompositeImages, EditMode.BatchWatermark].includes(activeTool);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg overflow-x-auto">
                    {MENU_STRUCTURE.IMAGE.tools.map(mode => (
                        <button key={mode} onClick={() => handleToolChange(mode)} className={`flex flex-col items-center justify-center p-2 rounded-lg w-24 h-20 text-center transition-colors duration-200 ${activeTool === mode ? 'bg-primary text-white' : 'text-text-secondary hover:bg-base-200 hover:text-white'}`} title={TOOLS[mode].name}>
                            <span className="w-8 h-8 flex items-center justify-center">{TOOLS[mode].icon}</span>
                            <span className="text-xs mt-1 leading-tight">{TOOLS[mode].name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col gap-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                    {isSingleFileUpload && <FileUpload onFileChange={handleFileChange} />}
                    {activeTool === EditMode.FaceSwap && <>
                        <div className="flex-1 flex flex-col gap-2"><h3 className="text-base font-semibold text-text-secondary text-center">Ảnh Gốc (Mặt)</h3><FileUpload onFileChange={setSourceFile} /></div>
                        <div className="flex-1 flex flex-col gap-2"><h3 className="text-base font-semibold text-text-secondary text-center">Ảnh Đích</h3><FileUpload onFileChange={setTargetFile} /></div>
                    </>}
                    {activeTool === EditMode.CompositeImages && <>
                        <div className="flex-1 flex flex-col gap-2"><h3 className="text-base font-semibold text-text-secondary text-center">Ảnh 1 (Chủ thể)</h3><FileUpload onFileChange={setCompositeImage1} /></div>
                        <div className="flex-1 flex flex-col gap-2"><h3 className="text-base font-semibold text-text-secondary text-center">Ảnh 2 (Nền)</h3><FileUpload onFileChange={setCompositeImage2} /></div>
                    </>}
                    {activeTool !== EditMode.BatchWatermark && renderControls()}
                </div>
                
                {error && <div className="text-red-400 text-center bg-base-100 p-3 rounded-lg flex-shrink-0">{error}</div>}

                <div className="flex-grow overflow-y-auto">
                    {renderDisplayArea()}
                </div>
            </div>
        </div>
    );
};


// Batch Watermark has a very different UI flow and is implemented as a self-contained component.
const BatchWatermarkEditor: React.FC = () => {
    // This is a placeholder for the full BatchWatermarkEditor component logic.
    // In a real scenario, you'd either fully integrate it or navigate to a separate view.
    // For simplicity here, we'll just show a message.
    return (
         <div className="text-center p-8 bg-base-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Gắn Watermark Hàng Loạt</h2>
            <p className="text-text-secondary">Do giao diện phức tạp, công cụ này được quản lý riêng biệt.</p>
            <p className="text-text-secondary mt-2">Vui lòng sử dụng component `BatchWatermarkEditor` đã được cung cấp.</p>
        </div>
    );
};


export default ImageStudio;