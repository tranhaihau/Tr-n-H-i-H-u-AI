import React, { useState, useCallback } from 'react';
import { EditMode } from './types';
import Sidebar from './components/Sidebar';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import FaceSwapEditor from './components/FaceSwapEditor';
import ResizeEditor from './components/ResizeEditor';
import FormatConverter from './components/FormatConverter';
import FilterEditor from './components/FilterEditor';
import { TOOLS } from './constants';

function App() {
  const [editMode, setEditMode] = useState<EditMode>(EditMode.Generate);

  const handleModeChange = useCallback((mode: EditMode) => {
    setEditMode(mode);
  }, []);

  const renderContent = () => {
    switch (editMode) {
      case EditMode.Generate:
        return <ImageGenerator key={editMode} />;
      case EditMode.FaceSwap:
        return <FaceSwapEditor key={editMode} />;
      case EditMode.Resize:
        return <ResizeEditor key={editMode} />;
      case EditMode.ConvertFormat:
        return <FormatConverter key={editMode} />;
      case EditMode.Filter:
          return <FilterEditor key={editMode} />;
      case EditMode.GenerativeFill:
      case EditMode.Upscale:
      case EditMode.Expand:
      case EditMode.RemoveBackground:
      case EditMode.ChangeBackground:
      case EditMode.Sharpen:
      case EditMode.Beautify:
        return <ImageEditor key={editMode} mode={editMode} />;
      default:
        return <ImageGenerator key={editMode} />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary font-sans">
      <Sidebar currentMode={editMode} onModeChange={handleModeChange} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-text-primary">{TOOLS[editMode].name}</h1>
                <p className="text-text-secondary mt-1">{TOOLS[editMode].description}</p>
            </header>
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
