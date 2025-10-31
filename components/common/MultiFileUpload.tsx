import React, { useState, useRef, useCallback } from 'react';

interface MultiFileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles: number;
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({ onFilesChange, maxFiles }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };
  
  const processFiles = (files: FileList | null) => {
    if (!files) return;

    if (files.length > maxFiles) {
      setError(`Bạn chỉ có thể chọn tối đa ${maxFiles} ảnh.`);
      onFilesChange([]);
      setFileCount(0);
      return;
    }
    
    setError(null);
    const filesArray = Array.from(files);
    onFilesChange(filesArray);
    setFileCount(filesArray.length);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      processFiles(event.dataTransfer.files);
      if (fileInputRef.current) {
        fileInputRef.current.files = event.dataTransfer.files;
      }
    }
  }, [maxFiles, onFilesChange]);

  return (
    <div
      className="w-full h-full border-2 border-dashed border-base-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors bg-base-200"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
      />
        <div className="text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 font-semibold">Nhấn để tải lên hoặc kéo thả</p>
            <p className="text-xs">Tối đa {maxFiles} ảnh</p>
             {fileCount > 0 && <p className="text-sm mt-2 text-green-400 font-bold">{fileCount} ảnh đã được chọn</p>}
            {error && <p className="text-sm mt-2 text-red-400">{error}</p>}
        </div>
    </div>
  );
};

export default MultiFileUpload;
