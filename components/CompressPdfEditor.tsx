import React, { useState, useEffect } from 'react';
import PdfUpload from './common/PdfUpload';
import Spinner from './common/Spinner';

declare const pdfjsLib: any;
declare const PDFLib: any;

type QualityLevel = 'low' | 'medium' | 'high';

const QUALITY_OPTIONS: Record<QualityLevel, { label: string; value: number; dpi: number }> = {
    low: { label: 'Chất lượng thấp (Dung lượng nhỏ nhất)', value: 0.6, dpi: 72 },
    medium: { label: 'Chất lượng trung bình (Khuyên dùng)', value: 0.75, dpi: 150 },
    high: { label: 'Chất lượng cao (Tốt nhất)', value: 0.92, dpi: 220 },
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const CompressPdfEditor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [quality, setQuality] = useState<QualityLevel>('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ originalSize: number; newSize: number; download: () => void } | null>(null);
    
    useEffect(() => {
        // Set the workerSrc for pdf.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }, []);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setResult(null);
        setError(null);
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        setProgress({ current: 0, total: 0 });

        try {
            const { PDFDocument } = PDFLib;
            const newPdfDoc = await PDFDocument.create();
            const existingPdfBytes = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: existingPdfBytes }).promise;
            
            setProgress({ current: 0, total: pdf.numPages });

            for (let i = 1; i <= pdf.numPages; i++) {
                setProgress({ current: i, total: pdf.numPages });
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: QUALITY_OPTIONS[quality].dpi / 72 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                const jpegDataUrl = canvas.toDataURL('image/jpeg', QUALITY_OPTIONS[quality].value);
                const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
                
                const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
                
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(jpegImage, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
            }

            const pdfBytes = await newPdfDoc.save();
            
            const download = () => {
                 const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                 const link = document.createElement('a');
                 link.href = URL.createObjectURL(blob);
                 link.download = `compressed-${file.name}`;
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
            };

            setResult({
                originalSize: file.size,
                newSize: pdfBytes.byteLength,
                download: download
            });

        } catch (err) {
            console.error("Compression failed:", err);
            setError("Nén PDF thất bại. File có thể bị hỏng hoặc không được hỗ trợ.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-full items-center">
            <div className="w-full max-w-2xl">
                <PdfUpload onFileChange={handleFileChange} />
                
                {file && (
                    <div className="mt-6 bg-base-100 p-4 rounded-lg border border-base-300">
                        <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Chọn Mức Độ Nén</h3>
                        <div className="space-y-3">
                            {Object.entries(QUALITY_OPTIONS).map(([key, { label }]) => (
                                <label key={key} className="flex items-center p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300">
                                    <input
                                        type="radio"
                                        name="quality"
                                        className="radio radio-primary"
                                        checked={quality === key}
                                        onChange={() => setQuality(key as QualityLevel)}
                                    />
                                    <span className="ml-4 text-text-secondary">{label}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-center mt-4 text-text-secondary">Lưu ý: Nén PDF sẽ chuyển đổi các trang thành hình ảnh. Văn bản sẽ không thể được chọn sau khi nén.</p>
                    </div>
                )}

                <div className="mt-6">
                    <button onClick={handleCompress} disabled={!file || isLoading} className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                        {isLoading ? <Spinner /> : null}
                        {isLoading ? `Đang nén... (${progress.current}/${progress.total})` : 'Nén PDF'}
                    </button>
                    {isLoading && <progress className="progress progress-primary w-full mt-2" value={progress.current} max={progress.total}></progress>}
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>

                {result && (
                    <div className="mt-6 text-center bg-base-100 p-6 rounded-lg border border-green-500">
                        <h3 className="text-2xl font-bold text-green-400 mb-4">Nén thành công!</h3>
                        <div className="flex justify-around items-center mb-6">
                             <div>
                                <p className="text-text-secondary">Dung lượng gốc</p>
                                <p className="text-xl font-semibold text-text-primary">{formatBytes(result.originalSize)}</p>
                            </div>
                             <div className="text-2xl text-text-secondary">➡️</div>
                             <div>
                                <p className="text-text-secondary">Dung lượng mới</p>
                                <p className="text-xl font-semibold text-green-400">{formatBytes(result.newSize)}</p>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-white mb-6">
                           Tiết kiệm: {formatBytes(result.originalSize - result.newSize)} 
                           ({(((result.originalSize - result.newSize) / result.originalSize) * 100).toFixed(0)}%)
                        </p>
                        <button onClick={result.download} className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                            Tải File Đã Nén
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompressPdfEditor;