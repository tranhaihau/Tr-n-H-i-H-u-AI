import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { EditMode } from '../types';
import { TOOLS } from '../constants';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';
import InteractiveImage, { Selection } from './common/InteractiveImage';
import OutpaintingCanvas, { ExpansionData } from './common/OutpaintingCanvas';

interface ImageEditorProps {
  mode: EditMode;
}

const BeautifyControls: React.FC<{ options: any; setOptions: (options: any) => void; }> = ({ options, setOptions }) => {
    const handleChange = (key: string, value: number | boolean) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <div className="bg-base-200 p-3 rounded-lg w-full space-y-3">
            <div>
                <label className="block text-sm font-medium text-text-secondary">Làm Mịn Da: {options.smoothSkin}%</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={options.smoothSkin}
                    onChange={(e) => handleChange('smoothSkin', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary">Làm To Mắt: {options.enlargeEyes}%</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={options.enlargeEyes}
                    onChange={(e) => handleChange('enlargeEyes', parseInt(e.target.value))}
                    className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary">Mặt V-line</label>
                 <input
                    type="checkbox"
                    checked={options.vLineFace}
                    onChange={(e) => handleChange('vLineFace', e.target.checked)}
                    className="toggle toggle-primary"
                />
            </div>
        </div>
    );
};

const ImageEditor: React.FC<ImageEditorProps> = ({ mode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [beautifyOptions, setBeautifyOptions] = useState({ smoothSkin: 50, enlargeEyes: 10, vLineFace: false, });
  const [expansionData, setExpansionData] = useState<ExpansionData | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const toolConfig = TOOLS[mode];
  
  const isGenerativeFillMode = mode === EditMode.GenerativeFill;
  const isRemoveWatermarkMode = mode === EditMode.RemoveWatermarkImage;
  const isBeautifyMode = mode === EditMode.Beautify;
  const isExpandMode = mode === EditMode.Expand;

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setProcessedImageUrl(null); 
    setSelection(null);
    setExpansionData(null);
    if (selectedFile) {
      setOriginalImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setOriginalImageUrl(null);
    }
  };

  const constructBeautifyPrompt = () => {
    let userPrompt = '';
    if (beautifyOptions.smoothSkin > 0) userPrompt += `smooth the skin to ${beautifyOptions.smoothSkin}%, preserving natural texture. `;
    if (beautifyOptions.enlargeEyes > 0) userPrompt += `slightly enlarge the eyes by about ${beautifyOptions.enlargeEyes}%. `;
    if (beautifyOptions.vLineFace) userPrompt += `create a subtle V-line jaw shape. `;
    if (!userPrompt) return "Beautify the face in this image with subtle enhancements for a natural look.";
    return toolConfig.defaultPrompt!.replace('{user_prompt}', userPrompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isLoading) return;

    // Conditionals for modes that need extra validation
    if (isGenerativeFillMode && !selection) {
      setError("Vui lòng vẽ một hộp xung quanh khu vực cần chỉnh sửa.");
      return;
    }
     if (isExpandMode && (!expansionData || (expansionData.newWidth === expansionData.imageWidth && expansionData.newHeight === expansionData.imageHeight))) {
        setError("Vui lòng kéo các cạnh để mở rộng ảnh.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    try {
      let imageFileToSend = file;
      let finalPrompt = '';

      // Determine prompt
      if (isGenerativeFillMode) {
          if (!prompt) {
               setError("Vui lòng nhập mô tả cho vùng cần chỉnh sửa.");
               setIsLoading(false);
               return;
          }
          finalPrompt = toolConfig.defaultPrompt!.replace('{user_prompt}', prompt);
      } else if (isBeautifyMode) {
          finalPrompt = constructBeautifyPrompt();
      } else if (isRemoveWatermarkMode) {
          finalPrompt = toolConfig.defaultPrompt!;
      } else {
          finalPrompt = `${toolConfig.defaultPrompt || ''}${prompt}`;
      }

      // Handle image preprocessing (canvas manipulation) for specific modes
      if (isGenerativeFillMode || isExpandMode) {
          const image = new Image();
          image.src = originalImageUrl!;
          await new Promise(resolve => { image.onload = resolve; });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");

          if (isGenerativeFillMode && selection && imageContainerRef.current) {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            ctx.drawImage(image, 0, 0);

            const scaleX = image.naturalWidth / imageContainerRef.current.clientWidth;
            const scaleY = image.naturalHeight / imageContainerRef.current.clientHeight;

            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.fillRect(
                selection.x * scaleX,
                selection.y * scaleY,
                selection.width * scaleX,
                selection.height * scaleY
            );
          } else if (isExpandMode && expansionData) {
              canvas.width = expansionData.newWidth;
              canvas.height = expansionData.newHeight;
              ctx.drawImage(image, expansionData.imageX, expansionData.imageY, expansionData.imageWidth, expansionData.imageHeight);
          }
          
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
          if (!blob) throw new Error("Could not convert canvas to blob.");
          imageFileToSend = new File([blob], file.name, { type: 'image/png' });
      }

      // For RemoveWatermarkImage and others, imageFileToSend is just the original file.

      const imageData = await editImage(imageFileToSend, finalPrompt);
      setProcessedImageUrl(`data:image/png;base64,${imageData}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const needsPromptInput = [EditMode.ChangeBackground, EditMode.Expand, EditMode.GenerativeFill].includes(mode);
  const isSubmitDisabled = isLoading || !file || (isGenerativeFillMode && (!selection || !prompt));
  
  const renderControls = () => {
    if (isBeautifyMode) {
        return <BeautifyControls options={beautifyOptions} setOptions={setBeautifyOptions} />;
    }
    if (needsPromptInput) {
        return (
             <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={toolConfig.promptPlaceholder}
              className="w-full flex-grow p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary resize-none"
              rows={3}
            />
        );
    }
    return null;
  };

  const renderOriginalImage = () => {
    if (!originalImageUrl) {
      return <div className="text-text-secondary">Tải ảnh lên để bắt đầu</div>;
    }
    if (isGenerativeFillMode) {
      return <InteractiveImage src={originalImageUrl} onSelectionChange={setSelection} />;
    }
    if (isExpandMode) {
      return <OutpaintingCanvas src={originalImageUrl} onExpansionChange={setExpansionData} />;
    }
    // For automatic watermark removal, just show the static image.
    if (isRemoveWatermarkMode) {
        return <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />;
    }
    return <img src={originalImageUrl} alt="Original" className="max-w-full max-h-[60vh] rounded-lg shadow-lg" />;
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex-shrink-0 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <FileUpload onFileChange={handleFileChange} />
          <div className="flex-grow flex flex-col gap-2">
            {renderControls()}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Đang xử lý...' : 'Thực Hiện'}
            </button>
          </div>
        </div>
      </form>
      
      {error && <div className="text-red-400 text-center mb-4 bg-base-100 p-3 rounded-lg">{error}</div>}

      <div className={`flex-grow ${mode === EditMode.Expand ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-2'} gap-4`}>
        <div ref={imageContainerRef} className="bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh]">
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Ảnh Gốc</h3>
          {renderOriginalImage()}
        </div>
        <div className={`bg-base-100 rounded-lg p-4 border border-dashed border-base-300 flex flex-col items-center justify-center min-h-[40vh] ${mode === EditMode.RemoveBackground ? 'checkerboard-bg' : ''}`}>
          <h3 className="text-lg font-semibold text-text-secondary mb-4">Kết Quả</h3>
          {isLoading && !error && (
            <div className="text-center">
              <Spinner large />
              <p className="mt-4 text-text-secondary">AI đang xử lý, vui lòng đợi...</p>
            </div>
          )}
          {processedImageUrl && (
            <div className="relative group">
              <img src={processedImageUrl} alt="Processed" className="max-w-full max-h-[60vh] rounded-lg shadow-xl" />
              <a
                href={processedImageUrl}
                download="processed-image.png"
                className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Tải xuống
              </a>
            </div>
          )}
          {!isLoading && !processedImageUrl && <div className="text-text-secondary">Kết quả sẽ hiển thị ở đây</div>}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;