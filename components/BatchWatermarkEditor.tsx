import React, { useState, useCallback, useRef, useEffect } from 'react';
import MultiFileUpload from './common/MultiFileUpload';
import Spinner from './common/Spinner';

declare const JSZip: any;

type WatermarkMode = 'text' | 'image' | 'frame';
type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const BatchWatermarkEditor: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [watermarkMode, setWatermarkMode] = useState<WatermarkMode>('text');
    
    // Text state
    const [watermarkText, setWatermarkText] = useState('© My Brand');
    const [textColor, setTextColor] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(4); // percentage of image height

    // Image/Logo state
    const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [imageSize, setImageSize] = useState(15); // percentage of image width

    // Frame state
    const [frameImage, setFrameImage] = useState<File | null>(null);
    const [framePreview, setFramePreview] = useState<string | null>(null);
    const frameInputRef = useRef<HTMLInputElement>(null);

    // Common state
    const [opacity, setOpacity] = useState(0.7);
    const [position, setPosition] = useState<Position>('bottom-right');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [previews, setPreviews] = useState<string[]>([]);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setWatermarkImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setWatermarkImage(null);
            setLogoPreview(null);
        }
    };
    
    const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFrameImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setFramePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setFrameImage(null);
            setFramePreview(null);
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.crossOrigin = 'anonymous';
        img.src = src;
    });

    const getCoordinates = (pos: Position, cw: number, ch: number, ww: number, wh: number) => {
        const margin = Math.min(cw, ch) * 0.02; // 2% margin
        let x = 0, y = 0;
        
        if (pos.includes('left')) x = margin;
        else if (pos.includes('center')) x = (cw - ww) / 2;
        else if (pos.includes('right')) x = cw - ww - margin;
        
        if (watermarkMode === 'text') {
            if (pos.includes('top')) y = margin + wh;
            else if (pos.includes('center')) y = (ch / 2) + (wh / 3);
            else if (pos.includes('bottom')) y = ch - margin;
        } else { // image
            if (pos.includes('top')) y = margin;
            else if (pos.includes('center')) y = (ch - wh) / 2;
            else if (pos.includes('bottom')) y = ch - wh - margin;
        }

        return { x, y };
    };
    
     const drawPreview = useCallback(async () => {
        const canvas = previewCanvasRef.current;
        if (!canvas || files.length === 0 || !previews[0]) {
            if(canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        };

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sourceImg = await loadImage(previews[0]);
        
        const parent = canvas.parentElement;
        if (!parent) return;

        const fitCanvasToParent = (imgWidth: number, imgHeight: number) => {
            const maxWidth = parent.clientWidth;
            const maxHeight = window.innerHeight * 0.4;
            const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
            canvas.width = imgWidth * scale;
            canvas.height = imgHeight * scale;
        };

        if (watermarkMode === 'frame') {
            const frameImg = frameImage ? await loadImage(URL.createObjectURL(frameImage)) : null;

            const targetAspectRatio = 16 / 9;
            const sourceAspectRatio = sourceImg.width / sourceImg.height;
            let sx = 0, sy = 0, sWidth = sourceImg.width, sHeight = sourceImg.height;

            if (sourceAspectRatio > targetAspectRatio) { // Wider
                sWidth = sourceImg.height * targetAspectRatio;
                sx = (sourceImg.width - sWidth) / 2;
            } else { // Taller
                sHeight = sourceImg.width / targetAspectRatio;
                sy = (sourceImg.height - sHeight) / 2;
            }

            fitCanvasToParent(sWidth, sHeight);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(sourceImg, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            
            if (frameImg) {
                ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            }
        } else {
             fitCanvasToParent(sourceImg.width, sourceImg.height);
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

            const watermarkImg = watermarkMode === 'image' && watermarkImage ? await loadImage(URL.createObjectURL(watermarkImage)) : null;

            if (!((watermarkMode === 'text' && watermarkText) || (watermarkMode === 'image' && watermarkImg))) {
                return;
            }

            ctx.globalAlpha = opacity;

            if (watermarkMode === 'text') {
                const calculatedFontSize = (canvas.height * fontSize) / 100;
                ctx.font = `${calculatedFontSize}px Arial`;
                ctx.fillStyle = textColor;
                const textMetrics = ctx.measureText(watermarkText);
                const { x, y } = getCoordinates(position, canvas.width, canvas.height, textMetrics.width, calculatedFontSize);
                ctx.fillText(watermarkText, x, y);
            } else if (watermarkImg) {
                const watermarkWidth = (canvas.width * imageSize) / 100;
                const watermarkHeight = watermarkImg.height * (watermarkWidth / watermarkImg.width);
                const { x, y } = getCoordinates(position, canvas.width, canvas.height, watermarkWidth, watermarkHeight);
                ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
            }
        }
    }, [files, previews, watermarkMode, watermarkText, textColor, fontSize, watermarkImage, imageSize, opacity, position, frameImage]);


    useEffect(() => {
        drawPreview();
    }, [drawPreview]);

    const handleFilesChange = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        const newPreviews: string[] = [];
        let loadedCount = 0;
        if (selectedFiles.length === 0) {
            setPreviews([]);
            return;
        }
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                loadedCount++;
                if (loadedCount === selectedFiles.length) {
                    setPreviews(newPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    };
    
    const isReadyToProcess = files.length > 0 && (
        (watermarkMode === 'text' && watermarkText) || 
        (watermarkMode === 'image' && watermarkImage) ||
        (watermarkMode === 'frame' && frameImage)
    );

    const applyWatermarkAndZip = async () => {
        if (!isReadyToProcess) return;

        setIsLoading(true);
        setError(null);
        setProgress(0);

        const zip = new JSZip();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError("Could not create canvas context.");
            setIsLoading(false);
            return;
        }

        const watermarkImg = watermarkMode === 'image' && watermarkImage ? await loadImage(URL.createObjectURL(watermarkImage)) : null;
        const frameImg = watermarkMode === 'frame' && frameImage ? await loadImage(URL.createObjectURL(frameImage)) : null;


        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const sourceImg = await loadImage(URL.createObjectURL(file));
                
                if (watermarkMode === 'frame' && frameImg) {
                    const targetAspectRatio = 16 / 9;
                    const sourceAspectRatio = sourceImg.width / sourceImg.height;
                    let sx = 0, sy = 0, sWidth = sourceImg.width, sHeight = sourceImg.height;

                    if (sourceAspectRatio > targetAspectRatio) {
                        sWidth = sourceImg.height * targetAspectRatio;
                        sx = (sourceImg.width - sWidth) / 2;
                    } else {
                        sHeight = sourceImg.width / targetAspectRatio;
                        sy = (sourceImg.height - sHeight) / 2;
                    }
                    canvas.width = sWidth;
                    canvas.height = sHeight;
                    ctx.drawImage(sourceImg, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
                    ctx.drawImage(frameImg, 0, 0, sWidth, sHeight);

                } else {
                    canvas.width = sourceImg.width;
                    canvas.height = sourceImg.height;
                    ctx.drawImage(sourceImg, 0, 0);
                    ctx.globalAlpha = opacity;

                    if (watermarkMode === 'text') {
                        const calculatedFontSize = (canvas.height * fontSize) / 100;
                        ctx.font = `${calculatedFontSize}px Arial`;
                        ctx.fillStyle = textColor;
                        const textMetrics = ctx.measureText(watermarkText);
                        const { x, y } = getCoordinates(position, canvas.width, canvas.height, textMetrics.width, calculatedFontSize);
                        ctx.fillText(watermarkText, x, y);
                    } else if (watermarkImg) {
                        const watermarkWidth = (canvas.width * imageSize) / 100;
                        const watermarkHeight = watermarkImg.height * (watermarkWidth / watermarkImg.width);
                        const { x, y } = getCoordinates(position, canvas.width, canvas.height, watermarkWidth, watermarkHeight);
                        ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight);
                    }
                }

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, file.type));
                if (blob) {
                    zip.file(file.name, blob);
                }
            } catch (err) {
                console.error(`Failed to process ${file.name}:`, err);
            } finally {
                setProgress(((i + 1) / files.length) * 100);
            }
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'watermarked_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsLoading(false);
    };
    
    const PositionSelector: React.FC = () => (
        <div className="grid grid-cols-3 gap-2">
            {(['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as Position[]).map(p => (
                <button key={p} onClick={() => setPosition(p)} className={`h-10 border-2 rounded-md ${position === p ? 'bg-primary border-primary' : 'bg-base-200 border-base-300'}`}></button>
            ))}
        </div>
    );

    const renderControls = () => {
        switch(watermarkMode) {
            case 'text':
                return (
                    <div className="space-y-4">
                        <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="Watermark Text" className="w-full p-2 bg-base-200 border border-base-300 rounded-lg" />
                        <div className="flex items-center gap-4">
                           <label>Màu:</label> <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="p-1 h-10 w-16 bg-base-200 border border-base-300 rounded-lg" />
                        </div>
                        <div>
                           <label>Kích thước chữ: {fontSize}%</label>
                           <input type="range" min="1" max="20" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>
                );
            case 'image':
                 return (
                    <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <div 
                                className="w-24 h-24 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary flex-shrink-0"
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain p-1" />
                                ) : (
                                    <span className="text-xs text-text-secondary text-center">Tải Logo</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={logoInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleLogoChange}
                            />
                            <div className="flex-grow w-full">
                                <label>Kích thước logo: {imageSize}%</label>
                                <input type="range" min="5" max="50" value={imageSize} onChange={e => setImageSize(parseInt(e.target.value))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                    </div>
                );
            case 'frame':
                return (
                     <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <div 
                                className="w-24 h-24 border-2 border-dashed border-base-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary flex-shrink-0"
                                onClick={() => frameInputRef.current?.click()}
                            >
                                {framePreview ? (
                                    <img src={framePreview} alt="Frame Preview" className="max-w-full max-h-full object-contain p-1" />
                                ) : (
                                    <span className="text-xs text-text-secondary text-center">Tải Khung (16:9)</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={frameInputRef} 
                                className="hidden" 
                                accept="image/png, image/webp"
                                onChange={handleFrameChange}
                            />
                            <p className="text-sm text-text-secondary flex-grow">Ảnh của bạn sẽ được tự động cắt theo tỷ lệ 16:9 để vừa với khung.</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 lg:max-w-md">
                     <MultiFileUpload onFilesChange={handleFilesChange} maxFiles={20} />
                </div>
                <div className="flex-1 bg-base-100 p-4 rounded-lg border border-base-300">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button onClick={() => setWatermarkMode('text')} className={`px-4 py-2 rounded-lg ${watermarkMode === 'text' ? 'bg-primary' : 'bg-base-200'}`}>Text</button>
                        <button onClick={() => setWatermarkMode('image')} className={`px-4 py-2 rounded-lg ${watermarkMode === 'image' ? 'bg-primary' : 'bg-base-200'}`}>Logo</button>
                        <button onClick={() => setWatermarkMode('frame')} className={`px-4 py-2 rounded-lg ${watermarkMode === 'frame' ? 'bg-primary' : 'bg-base-200'}`}>Khung</button>
                    </div>
                    
                    {renderControls()}

                    {watermarkMode !== 'frame' && (
                        <>
                            <hr className="my-4 border-base-300" />
                            <div className="space-y-4">
                                <div>
                                    <label>Độ mờ: {Math.round(opacity * 100)}%</label>
                                    <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <div>
                                    <label>Vị trí</label>
                                    <PositionSelector />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
             {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-text-secondary mb-2 text-center">Xem trước</h3>
                    <div className="bg-base-200 rounded-lg p-2 border border-dashed border-base-300 flex items-center justify-center min-h-[200px]">
                        <canvas ref={previewCanvasRef} className="max-w-full max-h-[40vh] rounded-md"></canvas>
                    </div>
                </div>
            )}
             <div className="mt-6">
                <button onClick={applyWatermarkAndZip} disabled={!isReadyToProcess || isLoading} className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? <Spinner /> : null}
                    {isLoading ? `Đang xử lý... ${Math.round(progress)}%` : `Áp dụng & Tải (${files.length}) Ảnh`}
                </button>
                {isLoading && <progress className="progress progress-primary w-full mt-2" value={progress} max="100"></progress>}
                {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
            </div>
            <div className="flex-grow mt-6 bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[20vh]">
                <h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh đã chọn ({files.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {previews.map((src, index) => (
                        <img key={index} src={src} className="w-full h-24 object-cover rounded-md" alt={`Preview ${index + 1}`} />
                    ))}
                    {previews.length === 0 && <p className="col-span-full text-center text-text-secondary">Xem trước các ảnh đã chọn sẽ ở đây.</p>}
                </div>
            </div>
        </div>
    );
};

export default BatchWatermarkEditor;
