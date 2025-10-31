import React, { useState, useEffect, useRef } from 'react';

declare const Qrious: any;

const QRCodeGenerator: React.FC = () => {
    const [text, setText] = useState('https://ai.google.dev/');
    const qrRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!text || !qrRef.current) return;

        const generate = () => {
            if (qrRef.current) {
                new Qrious({
                    element: qrRef.current,
                    value: text,
                    size: 300,
                    padding: 10,
                    level: 'H',
                    background: '#ffffff',
                    foreground: '#111827'
                });
            }
        };

        // Check if Qrious is available. If not, wait for it.
        if (typeof Qrious !== 'undefined') {
            generate();
        } else {
            const intervalId = setInterval(() => {
                if (typeof Qrious !== 'undefined') {
                    clearInterval(intervalId);
                    generate();
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, [text]);
    
    const handleDownload = () => {
        if(qrRef.current) {
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qrRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-grow w-full md:w-auto">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập văn bản hoặc link để tạo mã QR..."
                    className="w-full p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary resize-y"
                    rows={8}
                />
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-4 bg-base-100 p-6 rounded-lg border border-dashed border-base-300 w-full md:w-auto">
                 {text ? (
                    <canvas ref={qrRef}></canvas>
                 ) : (
                    <div className="w-[300px] h-[300px] flex items-center justify-center bg-base-200 rounded-md text-text-secondary">
                        Nhập nội dung để tạo mã
                    </div>
                 )}
                 <button
                    onClick={handleDownload}
                    disabled={!text}
                    className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-base-200 disabled:cursor-not-allowed"
                 >
                    Tải xuống QR Code
                 </button>
            </div>
        </div>
    );
};

export default QRCodeGenerator;