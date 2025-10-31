import React, { useState, useRef, useCallback } from 'react';

interface VideoUploadProps {
  onFileChange: (file: File | null) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onFileChange }) => {
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
       if(file.type.startsWith("video/")){
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
        accept="video/*"
      />
      
        <div className="text-text-secondary">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            <p className="mt-4 font-semibold text-lg">Chọn một file Video</p>
            <p className="text-sm">hoặc kéo và thả vào đây</p>
             {fileName && <p className="text-sm mt-4 text-green-400 font-bold bg-base-100 px-3 py-1 rounded-full">{fileName}</p>}
        </div>
    </div>
  );
};

export default VideoUpload;
