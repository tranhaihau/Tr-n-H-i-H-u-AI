import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { EditMode } from './types';
import Sidebar from './components/Sidebar';
import ImageStudio from './components/ImageStudio';
import PdfStudio from './components/PdfStudio';
import VideoStudio from './components/VideoStudio';
import ToolStudio from './components/ToolStudio';
import ChatContainer from './components/ChatContainer';
import { TOOLS, MENU_STRUCTURE } from './constants';

const StyleInjector: React.FC = () => {
    const checkerboardStyle = `
    .checkerboard-bg {
        background-color: #eee;
        background-image: linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.25) 75%, rgba(0,0,0,.25)), 
                          linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 25%, transparent 75%, rgba(0,0,0,.25) 75%, rgba(0,0,0,.25));
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
    }
    `;
    return ReactDOM.createPortal(
        <style>{checkerboardStyle}</style>,
        document.head
    );
};

function App() {
  const [editMode, setEditMode] = useState<EditMode>(EditMode.Generate);

  const handleModeChange = useCallback((mode: EditMode) => {
    setEditMode(mode);
  }, []);

  const imageModes = new Set(MENU_STRUCTURE.IMAGE.tools);
  const pdfModes = new Set(MENU_STRUCTURE.PDF.tools);
  const videoModes = new Set(MENU_STRUCTURE.VIDEO.tools);
  const toolModes = new Set(MENU_STRUCTURE.TOOLS.tools);
  const chatModes = new Set(MENU_STRUCTURE.AI_CHAT.tools);

  const renderContent = () => {
    if (imageModes.has(editMode)) {
      return <ImageStudio key="image-studio" initialMode={editMode} />;
    }
    if (pdfModes.has(editMode)) {
        return <PdfStudio key="pdf-studio" initialMode={editMode} />;
    }
    if (videoModes.has(editMode)) {
        return <VideoStudio key="video-studio" initialMode={editMode} />;
    }
    if (toolModes.has(editMode)) {
        return <ToolStudio key="tool-studio" initialMode={editMode} />;
    }
    if (chatModes.has(editMode)) {
        return <ChatContainer key="chat-container" />;
    }
    
    // Default fallback
    return <ImageStudio key="image-studio" initialMode={EditMode.Generate} />;
  };
  
  const getHeaderInfo = () => {
    if (imageModes.has(editMode)) {
        return { name: 'Image Studio', description: 'Một bộ công cụ AI mạnh mẽ để tạo và chỉnh sửa ảnh.'};
    }
    if (pdfModes.has(editMode)) {
        return { name: 'PDF Studio', description: 'Các công cụ để tạo, nén và trích xuất từ file PDF.'};
    }
    if (videoModes.has(editMode)) {
        return { name: 'Video Studio', description: 'Tạo và chỉnh sửa video bằng AI.'};
    }
    if (toolModes.has(editMode)) {
        return { name: 'Công Cụ Khác', description: 'Các công cụ hữu ích khác.'};
    }
    // For single-page tools like Chat
    return { name: TOOLS[editMode].name, description: TOOLS[editMode].description };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen bg-secondary font-sans">
      <StyleInjector />
      <Sidebar currentMode={editMode} onModeChange={handleModeChange} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold text-text-primary">{headerInfo.name}</h1>
                <p className="text-text-secondary mt-1">{headerInfo.description}</p>
            </header>
            <div className="flex-grow">
                {renderContent()}
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;