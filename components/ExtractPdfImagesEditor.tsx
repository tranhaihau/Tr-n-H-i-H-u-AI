import React, { useState, useEffect } from 'react';
import PdfUpload from './common/PdfUpload';
import Spinner from './common/Spinner';

declare const pdfjsLib: any;
declare const JSZip: any;

interface ExtractedImage {
    blob: Blob;
    url: string;
    name: string;
}

const ExtractPdfImagesEditor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        // Cleanup blob URLs on component unmount
        return () => {
            extractedImages.forEach(image => URL.revokeObjectURL(image.url));
        };
    }, [extractedImages]);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setExtractedImages([]);
        setError(null);
    };

    const handleExtract = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        setExtractedImages([]);
        setProgress({ current: 0, total: 0 });

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const numPages = pdf.numPages;
            setProgress({ current: 0, total: numPages });

            const extracted: ExtractedImage[] = [];
            let imageCount = 0;

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const operatorList = await page.getOperatorList();
                
                const imageOps = operatorList.fnArray.reduce((acc: any[], fn: any, j: number) => {
                    if (fn === pdfjsLib.OPS.paintImageXObject) {
                        acc.push(operatorList.argsArray[j][0]);
                    }
                    return acc;
                }, []);

                for (const imageName of imageOps) {
                    const image = await page.objs.get(imageName);
                    if (image && image.data) {
                        imageCount++;
                        let mimeType = 'image/jpeg';
                        let extension = 'jpg';

                        // Basic check for PNG header
                        if (image.data[0] === 0x89 && image.data[1] === 0x50 && image.data[2] === 0x4E && image.data[3] === 0x47) {
                            mimeType = 'image/png';
                            extension = 'png';
                        }
                        
                        const blob = new Blob([image.data], { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        extracted.push({
                            blob,
                            url,
                            name: `image_${imageCount}.${extension}`
                        });
                    }
                }
                setProgress({ current: i, total: numPages });
            }

            if (extracted.length === 0) {
                setError("Không tìm thấy ảnh nào trong file PDF.");
            }
            setExtractedImages(extracted);

        } catch (err) {
            console.error("Extraction failed:", err);
            setError("Trích xuất ảnh thất bại. File có thể bị hỏng hoặc không được hỗ trợ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadAll = async () => {
        if (extractedImages.length === 0) return;
        
        const zip = new JSZip();
        extractedImages.forEach(image => {
            zip.file(image.name, image.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'extracted_images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="w-full max-w-2xl mx-auto">
                <PdfUpload onFileChange={handleFileChange} />

                <div className="mt-6">
                    <button onClick={handleExtract} disabled={!file || isLoading} className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                        {isLoading ? <Spinner /> : null}
                        {isLoading ? `Đang xử lý... (${progress.current}/${progress.total})` : 'Trích xuất ảnh'}
                    </button>
                    {isLoading && <progress className="progress progress-primary w-full mt-2" value={progress.current} max={progress.total}></progress>}
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>
            </div>
            
            {extractedImages.length > 0 && (
                <div className="flex-grow mt-6 bg-base-100 rounded-lg p-4 border border-dashed border-base-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-text-secondary">
                            Kết quả: {extractedImages.length} ảnh được tìm thấy
                        </h3>
                        <button onClick={handleDownloadAll} className="px-4 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                            Tải tất cả (.zip)
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[50vh] overflow-y-auto p-2 bg-base-200 rounded-lg">
                        {extractedImages.map((image, index) => (
                             <div key={index} className="relative group aspect-square">
                                <img src={image.url} className="w-full h-full object-contain rounded-md bg-white p-1" alt={image.name} />
                                 <a
                                  href={image.url}
                                  download={image.name}
                                  className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExtractPdfImagesEditor;