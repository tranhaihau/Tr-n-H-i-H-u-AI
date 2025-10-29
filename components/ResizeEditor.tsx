import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './common/FileUpload';

const ResizeEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [resizedImageUrl, setResizedImageUrl] = useState<string | null>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResizedImageUrl(null);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setOriginalImageUrl(url);
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
        };
        img.src = url;
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setOriginalImageUrl(null);
      setOriginalSize(null);
      setWidth(0);
      setHeight(0);
    }
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    setWidth(newWidth);
    if (lockAspectRatio && originalSize && originalSize.width > 0) {
      const aspectRatio = originalSize.height / originalSize.width;
      setHeight(Math.round(newWidth * aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    setHeight(newHeight);
    if (lockAspectRatio && originalSize && originalSize.height > 0) {
      const aspectRatio = originalSize.width / originalSize.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleResize = useCallback(() => {
    if (!originalImageUrl || width <= 0 || height <= 0) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        setResizedImageUrl(canvas.toDataURL(file?.type || 'image/png'));
      }
    };
    img.src = originalImageUrl;
  }, [originalImageUrl, width, height, file]);
  
  useEffect(() => {
    if(originalImageUrl) {
        handleResize();
    }
  }, [width, height, originalImageUrl, handleResize]);


  return (
    <div className="flex flex-col h-full">
       <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <FileUpload onFileChange={handleFileChange} />
          <div className="flex-grow flex flex-col gap-4 bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="flex items-center gap-2">
                <div className='flex-1'>
                    <label htmlFor="width" className="block text-sm font-medium text-text-secondary">Rộng (px)</label>
                    <input type="number" id="width" value={width} onChange={handleWidthChange} className="w-full p-2 bg-base-200 border border-base-300 rounded-lg"/>
                </div>
                <button onClick={() => setLockAspectRatio(!lockAspectRatio)} className="mt-6 p-2 bg-base-200 rounded-lg">
                    {lockAspectRatio ? '🔒' : '🔓'}
                </button>
                <div className='flex-1'>
                    <label htmlFor="height" className="block text-sm font-medium text-text-secondary">Cao (px)</label>
                    <input type="number" id="height" value={height} onChange={handleHeightChange} className="w-full p-2 bg-base-200 border border-base-300 rounded-lg"/>
                </div>
            </div>
            {originalSize && <p className="text-sm text-center text-text-secondary">Kích thước gốc: {originalSize.width} x {originalSize.height} px</p>}
          </div>
        </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh Gốc</h3>
          {originalImageUrl ? (
            <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />
          ) : (
            <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>
          )}
        </div>
         <div className="bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Kết Quả</h3>
          {resizedImageUrl && (
            <div className="relative group">
              <img src={resizedImageUrl} alt="Resized" className="max-w-full max-h-[60vh] rounded-lg shadow-xl" />
              <a
                href={resizedImageUrl}
                download={`resized-${file?.name || 'image.png'}`}
                className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Tải xuống
              </a>
            </div>
          )}
          {!resizedImageUrl && file && <div className="text-text-secondary">Kết quả sẽ hiển thị ở đây</div>}
        </div>
      </div>
    </div>
  );
};

export default ResizeEditor;
