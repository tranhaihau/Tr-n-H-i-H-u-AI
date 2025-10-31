import React, { useState, useCallback } from 'react';
import MultiFileUpload from './common/MultiFileUpload';
import Spinner from './common/Spinner';

declare const PDFLib: any;

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

type PageSize = 'A4' | 'Letter' | 'Original';
type Orientation = 'portrait' | 'landscape';

const PAGE_SIZES: Record<Exclude<PageSize, 'Original'>, [number, number]> = {
    A4: [595.28, 841.89],
    Letter: [612, 792],
};

const CreatePdfEditor: React.FC = () => {
    const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
    const [pageSize, setPageSize] = useState<PageSize>('Original');
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dragItem = React.useRef<number | null>(null);
    const dragOverItem = React.useRef<number | null>(null);

    const handleFilesChange = (files: File[]) => {
        const newImageFiles: ImageFile[] = files.map(file => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
        }));
        setImageFiles(newImageFiles);
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newImageFiles = [...imageFiles];
        const draggedItemContent = newImageFiles.splice(dragItem.current, 1)[0];
        newImageFiles.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setImageFiles(newImageFiles);
    };

    const handleCreatePdf = async () => {
        if (imageFiles.length === 0) {
            setError("Vui lòng tải lên ít nhất một ảnh.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            let pageDimensions: [number, number];

            if (pageSize === 'Original') {
                const firstImgEl = await new Promise<HTMLImageElement>(resolve => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => { 
                        // Fallback in case of load error
                        resolve({ naturalWidth: PAGE_SIZES.A4[0], naturalHeight: PAGE_SIZES.A4[1] } as HTMLImageElement)
                    };
                    img.src = imageFiles[0].preview;
                });
                pageDimensions = [firstImgEl.naturalWidth, firstImgEl.naturalHeight];
            } else {
                pageDimensions = PAGE_SIZES[pageSize];
                if (orientation === 'landscape') {
                    pageDimensions = [pageDimensions[1], pageDimensions[0]];
                }
            }
            
            const [width, height] = pageDimensions;

            for (const imageFile of imageFiles) {
                const page = pdfDoc.addPage([width, height]);
                const imageBytes = await imageFile.file.arrayBuffer();
                
                let image;
                if (imageFile.file.type === 'image/png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    image = await pdfDoc.embedJpg(imageBytes);
                }

                const imageDims = image.scale(1);
                const scaleToFit = Math.min(width / imageDims.width, height / imageDims.height);
                const scaledWidth = imageDims.width * scaleToFit;
                const scaledHeight = imageDims.height * scaleToFit;

                page.drawImage(image, {
                    x: (width - scaledWidth) / 2,
                    y: (height - scaledHeight) / 2,
                    width: scaledWidth,
                    height: scaledHeight,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'created_document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err: any) {
            console.error("Failed to create PDF:", err);
            setError("Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <MultiFileUpload onFilesChange={handleFilesChange} maxFiles={50} />
                    <div className="mt-4 bg-base-100 p-4 rounded-lg border border-base-300 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Khổ Giấy</label>
                            <div className="flex gap-2">
                                <button onClick={() => setPageSize('Original')} className={`flex-1 py-2 rounded-lg ${pageSize === 'Original' ? 'bg-primary text-white' : 'bg-base-200'}`}>Kích thước gốc</button>
                                <button onClick={() => setPageSize('A4')} className={`flex-1 py-2 rounded-lg ${pageSize === 'A4' ? 'bg-primary text-white' : 'bg-base-200'}`}>A4</button>
                                <button onClick={() => setPageSize('Letter')} className={`flex-1 py-2 rounded-lg ${pageSize === 'Letter' ? 'bg-primary text-white' : 'bg-base-200'}`}>Letter</button>
                            </div>
                        </div>
                         {pageSize !== 'Original' && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Hướng Giấy</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setOrientation('portrait')} className={`flex-1 py-2 rounded-lg ${orientation === 'portrait' ? 'bg-primary text-white' : 'bg-base-200'}`}>Dọc</button>
                                    <button onClick={() => setOrientation('landscape')} className={`flex-1 py-2 rounded-lg ${orientation === 'landscape' ? 'bg-primary text-white' : 'bg-base-200'}`}>Ngang</button>
                                </div>
                            </div>
                         )}
                    </div>
                     <button onClick={handleCreatePdf} disabled={isLoading || imageFiles.length === 0} className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? <Spinner /> : null}
                        {isLoading ? `Đang tạo PDF...` : `Tạo PDF (${imageFiles.length} ảnh)`}
                    </button>
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>
                <div className="lg:col-span-2 bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[60vh]">
                    <h3 className="text-lg font-semibold text-text-secondary mb-4">Thứ tự trang (kéo để sắp xếp)</h3>
                    {imageFiles.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {imageFiles.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative aspect-square bg-base-200 rounded-lg cursor-grab active:cursor-grabbing"
                                    draggable
                                    onDragStart={() => dragItem.current = index}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={handleSort}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <img src={item.preview} alt={item.file.name} className="w-full h-full object-contain rounded-lg p-1" />
                                     <div className="absolute top-1 right-1 bg-secondary bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-secondary">Ảnh của bạn sẽ xuất hiện ở đây.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatePdfEditor;
