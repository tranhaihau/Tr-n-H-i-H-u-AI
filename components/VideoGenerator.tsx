import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { TOOLS } from '../constants';
import { EditMode } from '../types';
import Spinner from './common/Spinner';
import FileUpload from './common/FileUpload';

// FIX: Removed the global type declaration for `window.aistudio` to centralize it in `types.ts` and resolve declaration conflicts. This fixes the error on line 17.
const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // Fallback for local development or if aistudio is not available
            console.warn("aistudio context not found. Assuming API key is set in environment.");
            setApiKeySelected(true);
        }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume selection is successful to avoid race conditions
        setApiKeySelected(true);
    }
  };

  const handleProgressUpdate = (message: string) => {
    setProgress(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProgress(null);
    setGeneratedVideoUrl(null);

    try {
      const videoDataUrl = await generateVideo(prompt, file, handleProgressUpdate);
      setGeneratedVideoUrl(videoDataUrl);
      setProgress("Hoàn thành!");
    } catch (err: any) {
      let errorMessage = err.message || 'An unknown error occurred.';
       if (errorMessage.includes('Requested entity was not found.')) {
            errorMessage = "API key không hợp lệ. Vui lòng chọn lại API key.";
            setApiKeySelected(false);
       }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-base-100 p-8 rounded-lg border border-dashed border-base-300 text-center">
            <h2 className="text-xl font-bold mb-4">Cần có API Key</h2>
            <p className="mb-6 text-text-secondary">Tính năng tạo video yêu cầu bạn phải chọn API key của riêng mình. Vui lòng bật thanh toán cho dự án của bạn.</p>
            <button onClick={handleSelectKey} className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                Chọn API Key
            </button>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-4 text-sm text-accent hover:underline">
                Tìm hiểu thêm về thanh toán
            </a>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <FileUpload onFileChange={setFile} />
          <div className='flex-grow flex flex-col gap-2'>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={TOOLS[EditMode.GenerateVideo].promptPlaceholder}
              className="w-full flex-grow p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Đang tạo...' : 'Tạo Video'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="flex-grow mt-6 flex flex-col items-center justify-center bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[50vh]">
        {error && <div className="text-red-400 text-center">{error}</div>}
        
        {generatedVideoUrl && (
          <div className="relative group w-full max-w-2xl">
            <video src={generatedVideoUrl} controls autoPlay loop className="w-full rounded-lg shadow-xl" />
            <a
              href={generatedVideoUrl}
              download="generated-video.webm"
              className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              Tải xuống
            </a>
          </div>
        )}

        {!generatedVideoUrl && !isLoading && <div className="text-text-secondary">Video của bạn sẽ xuất hiện ở đây</div>}

        {isLoading && (
            <div className="text-center">
                <Spinner large />
                <p className="mt-4 text-text-primary font-semibold">{progress || 'AI đang khởi động...'}</p>
                <p className="mt-2 text-text-secondary text-sm">Quá trình này có thể mất vài phút, vui lòng không đóng tab.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;