import React, { useState } from 'react';
import { faceSwap } from '../services/geminiService';
import { TOOLS } from '../constants';
import { EditMode } from '../types';
import FileUpload from './common/FileUpload';
import Spinner from './common/Spinner';

const FaceSwapEditor: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceFile || !targetFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    try {
      const prompt = TOOLS[EditMode.FaceSwap].defaultPrompt;
      const imageData = await faceSwap(sourceFile, targetFile, prompt);
      setProcessedImageUrl(`data:image/png;base64,${imageData}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-secondary text-center">Ảnh Gốc (Chứa Gương Mặt)</h3>
            <FileUpload onFileChange={setSourceFile} />
        </div>
        <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-text-secondary text-center">Ảnh Đích</h3>
            <FileUpload onFileChange={setTargetFile} />
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isLoading || !sourceFile || !targetFile}
        className="w-full px-6 py-3 mb-6 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isLoading && <Spinner />}
        {isLoading ? 'Đang xử lý...' : 'Thực Hiện Ghép Mặt'}
      </button>

      {error && <div className="text-red-400 text-center mb-4 bg-base-100 p-3 rounded-lg">{error}</div>}

      <div className="flex-grow flex items-center justify-center bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[40vh]">
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
                download="faceswap-result.png"
                className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Tải xuống
              </a>
            </div>
          )}
          {!isLoading && !processedImageUrl && <div className="text-text-secondary">Kết quả sẽ hiển thị ở đây</div>}
      </div>
    </div>
  );
};

export default FaceSwapEditor;
