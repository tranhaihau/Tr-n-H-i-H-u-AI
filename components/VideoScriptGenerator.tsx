import React, { useState, useEffect } from 'react';
import { generateVideo, analyzeScript } from '../services/geminiService';
import Spinner from './common/Spinner';

interface GeneratedVideo {
    id: number;
    url: string;
    prompt: string;
}

const VideoScriptGenerator: React.FC = () => {
    const [script, setScript] = useState('');
    const [videoCount, setVideoCount] = useState(3);
    const [syncVideos, setSyncVideos] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analyzedScripts, setAnalyzedScripts] = useState<string[]>([]);
    const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                console.warn("aistudio context not found. Assuming API key is set in environment.");
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const handleAnalyze = async () => {
        if (!script || isAnalyzing) return;
        setIsAnalyzing(true);
        setError(null);
        setAnalyzedScripts([]);
        setGeneratedVideos([]);

        try {
            const scenes = await analyzeScript(script, videoCount, syncVideos);
            setAnalyzedScripts(scenes);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateVideos = async () => {
        if (analyzedScripts.length === 0 || isGenerating) return;
        setIsGenerating(true);
        setError(null);
        setGeneratedVideos([]);

        const allGenerated: GeneratedVideo[] = [];
        for (let i = 0; i < analyzedScripts.length; i++) {
            const sceneScript = analyzedScripts[i];
            try {
                setProgress(`Đang tạo video ${i + 1}/${analyzedScripts.length}...`);
                const videoUrl = await generateVideo(sceneScript, null, (message) => {
                    setProgress(`Đang tạo video ${i + 1}/${analyzedScripts.length}: ${message}`);
                });
                allGenerated.push({ id: i, url: videoUrl, prompt: sceneScript });
                setGeneratedVideos([...allGenerated]);
            } catch (err: any) {
                let errorMessage = `Lỗi khi tạo video ${i + 1}: ${err.message}`;
                if (errorMessage.includes('Requested entity was not found.')) {
                    errorMessage = "API key không hợp lệ. Vui lòng chọn lại API key.";
                    setApiKeySelected(false);
                }
                setError(errorMessage);
                // Stop generation on error
                break;
            }
        }

        setProgress(null);
        setIsGenerating(false);
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
        <div className="flex flex-col h-full space-y-6">
            <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-4">
                <div>
                    <label htmlFor="script-input" className="block text-lg font-semibold text-text-primary mb-2">
                        1. Nhập kịch bản video
                    </label>
                    <textarea
                        id="script-input"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Ví dụ: Cảnh 1: Một chú mèo con đang ngủ trưa dưới ánh nắng. Cảnh 2: Nó thức dậy và vươn vai. Cảnh 3: Nó đuổi theo một con bướm trong vườn..."
                        className="w-full p-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary resize-y"
                        rows={6}
                    />
                </div>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label htmlFor="video-count" className="block text-lg font-semibold text-text-primary mb-2">
                            2. Chọn số lượng video
                        </label>
                        <input
                            type="number"
                            id="video-count"
                            value={videoCount}
                            onChange={(e) => setVideoCount(Math.max(1, parseInt(e.target.value)))}
                            min="1"
                            max="10"
                            className="p-3 w-32 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                    </div>
                     <div className="flex items-center gap-2 pb-1" title="Giữ cho nhân vật và bối cảnh nhất quán giữa các video.">
                        <input
                            type="checkbox"
                            id="sync-videos-checkbox"
                            checked={syncVideos}
                            onChange={(e) => setSyncVideos(e.target.checked)}
                            className="w-5 h-5 rounded text-primary bg-base-200 border-base-300 focus:ring-primary"
                        />
                        <label htmlFor="sync-videos-checkbox" className="text-text-secondary cursor-pointer">
                            Đồng bộ video
                        </label>
                    </div>
                    <div className="flex-grow">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !script}
                            className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isAnalyzing && <Spinner />}
                            {isAnalyzing ? 'Đang phân tích...' : 'Phân Tích'}
                        </button>
                    </div>
                </div>
            </div>

            {isAnalyzing && <div className="text-center"><Spinner large /></div>}
            
            {analyzedScripts.length > 0 && (
                <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-4">
                    <h2 className="text-xl font-semibold text-text-primary">3. Kịch bản đã phân tích</h2>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {analyzedScripts.map((scene, index) => (
                            <div key={index} className="bg-base-200 p-3 rounded-lg">
                                <p className="font-bold text-text-secondary">Video {index + 1}:</p>
                                <p className="text-text-primary">{scene}</p>
                            </div>
                        ))}
                    </div>
                     <button
                        onClick={handleGenerateVideos}
                        disabled={isGenerating}
                        className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isGenerating && <Spinner />}
                        {isGenerating ? 'Đang tạo...' : `Tạo ${analyzedScripts.length} Videos`}
                    </button>
                </div>
            )}
            
            {error && <div className="text-red-400 text-center bg-base-100 p-3 rounded-lg">{error}</div>}

            {(isGenerating || generatedVideos.length > 0) && (
                <div className="flex-grow bg-base-100 rounded-lg p-4 border border-dashed border-base-300 min-h-[30vh]">
                     <h2 className="text-xl font-semibold text-text-primary text-center mb-4">Kết quả Video</h2>
                     {progress && <p className="text-center text-text-secondary mb-4">{progress}</p>}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {generatedVideos.map(video => (
                            <div key={video.id} className="bg-base-200 p-2 rounded-lg">
                                <video src={video.url} controls loop className="w-full rounded-md aspect-video"></video>
                                <p className="text-xs text-text-secondary mt-2 p-1 truncate" title={video.prompt}>{video.prompt}</p>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    );
};

export default VideoScriptGenerator;