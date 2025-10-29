import React, { useState, useCallback, useRef } from 'react';
import FileUpload from './common/FileUpload';

const FILTERS = [
    { name: 'None', style: 'none' },
    { name: 'Clarendon', style: 'contrast(1.2) saturate(1.35)' },
    { name: 'Gingham', style: 'brightness(1.05) hue-rotate(-10deg)' },
    { name: 'Moon', style: 'grayscale(1) contrast(1.1) brightness(1.1)' },
    { name: 'Lark', style: 'contrast(.9) brightness(1.1) saturate(1.1)' },
    { name: 'Reyes', style: 'sepia(.22) brightness(1.1) contrast(.85) saturate(.75)' },
    { name: 'Juno', style: 'contrast(1.1) brightness(1.05) saturate(1.4)' },
    { name: 'Slumber', style: 'saturate(0.66) brightness(1.05)'},
    { name: 'Crema', style: 'sepia(.5) contrast(1.1) brightness(1.1)'},
    { name: 'Ludwig', style: 'brightness(1.05) contrast(1.05) saturate(0.1)'},
    { name: 'Aden', style: 'hue-rotate(-20deg) contrast(.9) saturate(.85) brightness(1.2)'},
    { name: 'Perpetua', style: 'contrast(1.1) brightness(1.2) saturate(1.1)'}
];

const FilterEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setSelectedFilter('none');
    if (selectedFile) {
      setOriginalImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setOriginalImageUrl(null);
    }
  };

  const handleDownload = useCallback(() => {
    if (!originalImageUrl || !file) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.filter = selectedFilter;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL(file.type);
            const link = document.createElement('a');
            const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            link.download = `${fileName}-${selectedFilter !== 'none' ? FILTERS.find(f => f.style === selectedFilter)?.name.toLowerCase() : 'filtered'}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    img.src = originalImageUrl;
  }, [originalImageUrl, file, selectedFilter]);
  

  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0 mb-4">
             <FileUpload onFileChange={handleFileChange} />
        </div>
        
        <div className="flex-grow bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh] mb-4">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh Xem Trước</h3>
          {originalImageUrl ? (
             <div className="relative group">
                <img ref={imageRef} src={originalImageUrl} alt="Original" className="max-w-full max-h-[50vh] rounded-lg shadow-lg" style={{ filter: selectedFilter }} />
                 <button
                    onClick={handleDownload}
                    disabled={!file}
                    className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                    Tải xuống
                </button>
            </div>
          ) : (
            <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>
          )}
        </div>
        
        <div className="flex-shrink-0 bg-base-100 p-2 rounded-lg">
            <h3 className="text-lg font-semibold text-text-secondary mb-2 px-2">Chọn Bộ Lọc</h3>
            <div className="flex overflow-x-auto space-x-3 p-2">
                {FILTERS.map(filter => (
                    <div key={filter.name} className="flex-shrink-0 text-center cursor-pointer" onClick={() => setSelectedFilter(filter.style)}>
                        <div className={`w-24 h-24 rounded-lg border-2 ${selectedFilter === filter.style ? 'border-primary' : 'border-transparent'}`}>
                             {originalImageUrl ? 
                                <img src={originalImageUrl} alt={filter.name} className="w-full h-full object-cover rounded-md" style={{ filter: filter.style }} /> 
                                : <div className="w-full h-full bg-base-200 rounded-md"></div>
                             }
                        </div>
                        <p className="mt-1 text-sm">{filter.name}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default FilterEditor;
