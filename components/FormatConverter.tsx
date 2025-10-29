import React, { useState, useCallback } from 'react';
import FileUpload from './common/FileUpload';

type Format = 'image/jpeg' | 'image/png';

const FormatConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<Format>('image/jpeg');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setOriginalImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setOriginalImageUrl(null);
    }
  };

  const handleConvertAndDownload = useCallback(() => {
    if (!originalImageUrl || !file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <FileUpload onFileChange={handleFileChange} />
        <div className="flex-grow flex flex-col gap-4 bg-base-100 p-4 rounded-lg border border-base-300 justify-center">
            <div className="flex items-center justify-center gap-4">
                <label className="cursor-pointer">
                    <input type="radio" name="format" value="image/jpeg" checked={outputFormat === 'image/jpeg'} onChange={() => setOutputFormat('image/jpeg')} className="radio radio-primary" />
                    <span className="ml-2 text-text-primary">JPG</span>
                </label>
                 <label className="cursor-pointer">
                    <input type="radio" name="format" value="image/png" checked={outputFormat === 'image/png'} onChange={() => setOutputFormat('image/png')} className="radio radio-primary" />
                    <span className="ml-2 text-text-primary">PNG</span>
                </label>
            </div>
            {outputFormat === 'image/jpeg' && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Chất lượng JPEG: {Math.round(jpegQuality * 100)}%</label>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={jpegQuality}
                        onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            )}
             <button
                onClick={handleConvertAndDownload}
                disabled={!file}
                className="w-full px-6 py-3 mt-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed transition-colors"
            >
                Chuyển đổi & Tải xuống
            </button>
        </div>
      </div>
       <div className="flex-grow bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh Gốc</h3>
          {originalImageUrl ? (
            <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
          ) : (
            <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>
          )}
        </div>
    </div>
  );
};

export default FormatConverter;
