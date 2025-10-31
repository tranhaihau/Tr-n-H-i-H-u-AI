import React, { useState } from 'react';
import VideoUpload from './common/VideoUpload';
import Spinner from './common/Spinner';
import { editImage } from '../services/geminiService';
import { TOOLS } from '../constants';
import { EditMode } from '../types';

declare const Whammy: any;

const VideoWatermarkRemover: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ message: '', percentage: 0 });
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (selectedFile: File | null) => {
        setFile(selectedFile);
        setResultVideoUrl(null);
        setError(null);
    };

    const processVideo = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResultVideoUrl(null);

        try {
            const videoElement = document.createElement('video');
            videoElement.src = URL.createObjectURL(file);

            await new Promise<void>((resolve, reject) => {
                videoElement.onloadedmetadata = () => resolve();
                videoElement.onerror = () => reject('Could not load video metadata.');
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context.');

            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const frameRate = 25;
            const totalFrames = Math.floor(videoElement.duration * frameRate);
            const whammyVideo = new Whammy.Video(frameRate);
            
            const watermarkPrompt = TOOLS[EditMode.RemoveWatermarkVideo].defaultPrompt!;

            for (let i = 0; i < totalFrames; i++) {
                setProgress({ message: `Đang xử lý khung ${i + 1} / ${totalFrames}`, percentage: (i / totalFrames) * 100 });
                
                videoElement.currentTime = i / frameRate;
                await new Promise<void>(resolve => { videoElement.onseeked = () => resolve(); });
                
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                const frameBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                if (!frameBlob) continue;

                const frameFile = new File([frameBlob], `frame_${i}.jpg`, { type: 'image/jpeg' });
                
                let processedImageData: string | null = null;
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        processedImageData = await editImage(frameFile, watermarkPrompt);
                        break; // Success
                    } catch (e) {
                        console.warn(`Attempt ${attempt + 1} failed for frame ${i}:`, e);
                        if (attempt === 2) throw e; // Rethrow after last attempt
                    }
                }

                if (processedImageData) {
                    const processedImage = new Image();
                    processedImage.src = `data:image/png;base64,${processedImageData}`;
                    await new Promise<void>(resolve => { processedImage.onload = () => resolve(); });
                    
                    ctx.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
                    whammyVideo.add(ctx);
                }
            }

            setProgress({ message: 'Đang ghép video...', percentage: 100 });
            
            const outputBlob = await new Promise<Blob>((resolve) => {
                whammyVideo.compile(false, (output: Blob) => {
                    resolve(output);
                });
            });
            const url = URL.createObjectURL(outputBlob);
            setResultVideoUrl(url);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Đã xảy ra lỗi không xác định trong quá trình xử lý video.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex flex-col h-full items-center">
            <div className="w-full max-w-2xl">
                <VideoUpload onFileChange={handleFileChange} />
                
                 <div className="mt-6">
                    <button onClick={processVideo} disabled={!file || isLoading} className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                        {isLoading ? <Spinner /> : null}
                        {isLoading ? `Đang xử lý...` : 'Xóa Watermark'}
                    </button>
                    {isLoading && (
                        <div className="mt-2 text-center">
                            <p className="text-text-secondary">{progress.message}</p>
                            <progress className="progress progress-primary w-full mt-1" value={progress.percentage} max="100"></progress>
                        </div>
                    )}
                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                </div>

                {resultVideoUrl ? (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">Video kết quả</h3>
                        <video src={resultVideoUrl} controls className="w-full rounded-lg shadow-lg"></video>
                        <a 
                            href={resultVideoUrl} 
                            download={`watermark-removed-${file?.name.replace(/\.[^/.]+$/, "")}.webm`}
                            className="w-full mt-4 inline-block text-center px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                        >
                            Tải Video (.webm)
                        </a>
                    </div>
                ) : (
                    <div className="mt-8 text-center bg-base-100 p-6 rounded-lg border border-base-300">
                        <h3 className="text-lg font-bold text-text-primary mb-2">Lưu ý quan trọng</h3>
                        <p className="text-text-secondary text-sm">
                            Quá trình xử lý video có thể mất nhiều thời gian, tùy thuộc vào độ dài video và cấu hình máy của bạn. Âm thanh sẽ bị loại bỏ.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoWatermarkRemover;