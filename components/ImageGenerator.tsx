import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { TOOLS } from '../constants';
import { EditMode } from '../types';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageData = await generateImage(prompt, file);
      setGeneratedImage(`data:image/png;base64,${imageData}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <FileUpload onFileChange={setFile} />
          <div className='flex-grow flex flex-col gap-2'>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={TOOLS[EditMode.Generate].promptPlaceholder}
              className="w-full flex-grow p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Đang tạo...' : 'Tạo Ảnh'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="flex-grow mt-6 flex items-center justify-center bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[50vh]">
        {error && <div className="text-red-400 text-center">{error}</div>}
        
        {generatedImage ? (
          <div className="relative group">
            <img src={generatedImage} alt="Generated" className="max-w-full max-h-[70vh] rounded-lg shadow-xl" />
            <a
              href={generatedImage}
              download="generated-image.png"
              className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Tải xuống
            </a>
          </div>
        ) : (
          !isLoading && <div className="text-text-secondary">Hình ảnh của bạn sẽ xuất hiện ở đây</div>
        )}

        {isLoading && !error && <div className="text-center">
            <Spinner large />
            <p className="mt-4 text-text-secondary">AI đang sáng tạo, vui lòng đợi trong giây lát...</p>
        </div>}
      </div>
    </div>
  );
};

export default ImageGenerator;
