import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface ExpansionData {
  newWidth: number;
  newHeight: number;
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;
}

interface OutpaintingCanvasProps {
  src: string;
  onExpansionChange: (data: ExpansionData | null) => void;
}

const OutpaintingCanvas: React.FC<OutpaintingCanvasProps> = ({ src, onExpansionChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [naturalImageSize, setNaturalImageSize] = useState({ width: 0, height: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

    const [viewState, setViewState] = useState({ scale: 1, panX: 0, panY: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [draggingHandle, setDraggingHandle] = useState<string | null>(null);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const fitToScreen = useCallback(() => {
        if (!containerRef.current || !naturalImageSize.width) return;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const margin = 40;

        const scaleX = (containerWidth - margin) / naturalImageSize.width;
        const scaleY = (containerHeight - margin) / naturalImageSize.height;
        const scale = Math.min(scaleX, scaleY, 1);

        const newImageWidth = naturalImageSize.width * scale;
        const newImageHeight = naturalImageSize.height * scale;
        
        setImageSize({ width: newImageWidth, height: newImageHeight });
        setPadding({ top: 0, right: 0, bottom: 0, left: 0 });

        setViewState({
            scale: 1,
            panX: (containerWidth - newImageWidth) / 2,
            panY: (containerHeight - newImageHeight) / 2,
        });
    }, [naturalImageSize]);

    useEffect(() => {
        const img = new Image();
        img.onload = () => setNaturalImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        img.src = src;
    }, [src]);

    useEffect(() => {
        fitToScreen();
        window.addEventListener('resize', fitToScreen);
        return () => window.removeEventListener('resize', fitToScreen);
    }, [fitToScreen]);
    
    useEffect(() => {
        if (!naturalImageSize.width || !imageSize.width) return;
        const scaleToNatural = naturalImageSize.width / imageSize.width;

        const data: ExpansionData = {
            newWidth: Math.round((imageSize.width + padding.left + padding.right) * scaleToNatural),
            newHeight: Math.round((imageSize.height + padding.top + padding.bottom) * scaleToNatural),
            imageX: Math.round(padding.left * scaleToNatural),
            imageY: Math.round(padding.top * scaleToNatural),
            imageWidth: naturalImageSize.width,
            imageHeight: naturalImageSize.height,
        };
        onExpansionChange(data);
    }, [padding, imageSize, naturalImageSize, onExpansionChange]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setLastMousePos({ x: e.clientX, y: e.clientY });
        const target = e.target as HTMLElement;
        if (target.dataset.handle) {
            setDraggingHandle(target.dataset.handle);
        } else {
            setIsPanning(true);
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;

        if (isPanning) {
            setViewState(prev => ({ ...prev, panX: prev.panX + dx, panY: prev.panY + dy }));
        } else if (draggingHandle) {
            const worldDx = dx / viewState.scale;
            const worldDy = dy / viewState.scale;
            
            setPadding(prev => {
                let { top, right, bottom, left } = prev;
                if (draggingHandle === 'top') top = Math.max(0, top - worldDy);
                if (draggingHandle === 'bottom') bottom = Math.max(0, bottom + worldDy);
                if (draggingHandle === 'left') left = Math.max(0, left - worldDx);
                if (draggingHandle === 'right') right = Math.max(0, right + worldDx);
                return { top, right, bottom, left };
            });
        }
        setLastMousePos({ x: e.clientX, y: e.clientY });
    }, [isPanning, draggingHandle, lastMousePos, viewState.scale]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
        setDraggingHandle(null);
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = 1.1;
        const newScale = e.deltaY < 0 ? viewState.scale * zoomFactor : viewState.scale / zoomFactor;
        const clampedScale = Math.max(0.1, Math.min(10, newScale));

        const worldX = (mouseX - viewState.panX) / viewState.scale;
        const worldY = (mouseY - viewState.panY) / viewState.scale;

        const newPanX = mouseX - worldX * clampedScale;
        const newPanY = mouseY - worldY * clampedScale;

        setViewState({ scale: clampedScale, panX: newPanX, panY: newPanY });
    };
    
    const zoom = (direction: 'in' | 'out') => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        handleWheel({ deltaY: direction === 'in' ? -100 : 100, clientX: centerX + rect.left, clientY: centerY + rect.top, preventDefault: () => {} } as any);
    }

    useEffect(() => {
        const container = containerRef.current;
        if (!container || (!isPanning && !draggingHandle)) return;

        const mouseMoveListener = (e: MouseEvent) => handleMouseMove(e);
        const mouseUpListener = () => handleMouseUp();
        
        window.addEventListener('mousemove', mouseMoveListener);
        window.addEventListener('mouseup', mouseUpListener);

        return () => {
            window.removeEventListener('mousemove', mouseMoveListener);
            window.removeEventListener('mouseup', mouseUpListener);
        };
    }, [isPanning, draggingHandle, handleMouseMove, handleMouseUp]);

    const canvasWidth = imageSize.width + padding.left + padding.right;
    const canvasHeight = imageSize.height + padding.top + padding.bottom;
    const handleSize = 12;

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full relative overflow-hidden bg-base-200"
            style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
        >
            <div style={{
                transform: `translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.scale})`,
                transformOrigin: 'top left',
                width: canvasWidth,
                height: canvasHeight,
            }}>
                <div className="checkerboard-bg" style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img
                        src={src}
                        alt="outpainting source"
                        className="shadow-xl"
                        style={{
                            position: 'absolute',
                            top: padding.top,
                            left: padding.left,
                            width: imageSize.width,
                            height: imageSize.height,
                            pointerEvents: 'none', // Prevents img from capturing mouse events
                        }}
                    />
                    
                    {/* Handles with larger, easier-to-grab touch area */}
                    <div data-handle="top" className="absolute" style={{ top: padding.top, left: padding.left, width: imageSize.width, height: handleSize, marginTop: -handleSize / 2, cursor: 'n-resize' }} />
                    <div data-handle="bottom" className="absolute" style={{ top: padding.top + imageSize.height, left: padding.left, width: imageSize.width, height: handleSize, marginTop: -handleSize / 2, cursor: 's-resize' }} />
                    <div data-handle="left" className="absolute" style={{ top: padding.top, left: padding.left, width: handleSize, height: imageSize.height, marginLeft: -handleSize / 2, cursor: 'w-resize' }} />
                    <div data-handle="right" className="absolute" style={{ top: padding.top, left: padding.left + imageSize.width, width: handleSize, height: imageSize.height, marginLeft: -handleSize / 2, cursor: 'e-resize' }} />

                    {/* Visual representation of handles */}
                    <div className="absolute bg-primary rounded-full pointer-events-none" style={{ top: padding.top - 4, left: padding.left + imageSize.width / 2 - 4, width: 8, height: 8 }} />
                    <div className="absolute bg-primary rounded-full pointer-events-none" style={{ top: padding.top + imageSize.height - 4, left: padding.left + imageSize.width / 2 - 4, width: 8, height: 8 }} />
                    <div className="absolute bg-primary rounded-full pointer-events-none" style={{ top: padding.top + imageSize.height / 2 - 4, left: padding.left - 4, width: 8, height: 8 }} />
                    <div className="absolute bg-primary rounded-full pointer-events-none" style={{ top: padding.top + imageSize.height / 2 - 4, left: padding.left + imageSize.width - 4, width: 8, height: 8 }} />
                </div>
            </div>

            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-secondary bg-opacity-70 p-1 rounded-lg text-white">
                <button onClick={() => zoom('out')} className="w-8 h-8 flex items-center justify-center hover:bg-base-100 rounded-md">-</button>
                <button onClick={fitToScreen} className="px-3 h-8 hover:bg-base-100 rounded-md">Fit</button>
                <button onClick={() => zoom('in')} className="w-8 h-8 flex items-center justify-center hover:bg-base-100 rounded-md">+</button>
            </div>
        </div>
    );
};

export default OutpaintingCanvas;