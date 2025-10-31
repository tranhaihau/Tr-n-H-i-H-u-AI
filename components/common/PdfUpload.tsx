import React, { useState, useRef, useCallback } from 'react';

interface PdfUploadProps {
  onFileChange: (file: File | null) => void;
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onFileChange }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileChange(file);
    } else {
      setFileName(null);
      onFileChange(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
       if(file.type === "application/pdf"){
            setFileName(file.name);
            onFileChange(file);
            if (fileInputRef.current) {
                fileInputRef.current.files = event.dataTransfer.files;
            }
       }
    }
  }, [onFileChange]);

  return (
    <div
      className="w-full h-full border-2 border-dashed border-base-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors bg-base-200"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf"
      />
      
        <div className="text-text-secondary">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13.5V12h1.5a1.5 1.5 0 1 1 0 3H9"></path><path d="M15.5 12H14v6h1.5"></path><path d="M12.5 18H14"></path><path d="M10 18v-6"></path><path d="M8 12h2"></path></svg>
            <p className="mt-4 font-semibold text-lg">Chọn một file PDF</p>
            <p className="text-sm">hoặc kéo và thả vào đây</p>
             {fileName && <p className="text-sm mt-4 text-green-400 font-bold bg-base-100 px-3 py-1 rounded-full">{fileName}</p>}
        </div>
    </div>
  );
};

export default PdfUpload;