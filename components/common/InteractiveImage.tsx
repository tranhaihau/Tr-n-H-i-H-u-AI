import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteractiveImageProps {
  src: string;
  selection: Selection | null;
  onSelectionChange: (selection: Selection | null) => void;
}

const InteractiveImage: React.FC<InteractiveImageProps> = ({ src, selection, onSelectionChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);

  const getCoords = (e: React.MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectionChange(null);
    setStartPoint(getCoords(e));
    setEndPoint(getCoords(e));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startPoint) return;
    e.preventDefault();
    setEndPoint(getCoords(e));
  };

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (startPoint) {
      const finalEndPoint = endPoint || startPoint;
      const newSelection = {
        x: Math.min(startPoint.x, finalEndPoint.x),
        y: Math.min(startPoint.y, finalEndPoint.y),
        width: Math.abs(startPoint.x - finalEndPoint.x),
        height: Math.abs(startPoint.y - finalEndPoint.y),
      };
      if (newSelection.width > 5 && newSelection.height > 5) {
        onSelectionChange(newSelection);
      } else {
        onSelectionChange(null);
      }
      setStartPoint(null);
      setEndPoint(null);
    }
  }, [startPoint, endPoint, onSelectionChange]);
  
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);
    if(startPoint) {
        window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseUp, startPoint]);


  const getBoxStyle = (): React.CSSProperties => {
    if (startPoint && endPoint) {
      return {
        position: 'absolute',
        left: `${Math.min(startPoint.x, endPoint.x)}px`,
        top: `${Math.min(startPoint.y, endPoint.y)}px`,
        width: `${Math.abs(startPoint.x - endPoint.x)}px`,
        height: `${Math.abs(startPoint.y - endPoint.y)}px`,
        border: '2px dashed #f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.2)',
        boxSizing: 'border-box',
      };
    }
    if (selection) {
       return {
        position: 'absolute',
        left: `${selection.x}px`,
        top: `${selection.y}px`,
        width: `${selection.width}px`,
        height: `${selection.height}px`,
        border: '2px solid #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        boxSizing: 'border-box',
      };
    }
    return {};
  };

  return (
    <div
      ref={containerRef}
      className="relative max-w-full max-h-[60vh] overflow-hidden"
      style={{ touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt="Interactive"
        className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
        style={{ pointerEvents: 'none' }}
      />
      {(startPoint || selection) && <div style={getBoxStyle()}></div>}
    </div>
  );
};

export default InteractiveImage;