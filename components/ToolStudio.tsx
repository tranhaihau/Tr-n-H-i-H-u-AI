import React, { useState, useEffect } from 'react';
import { EditMode } from '../types';
import { TOOLS, MENU_STRUCTURE } from '../constants';
import PhotoshopOnline from './PhotoshopOnline';
import QRCodeGenerator from './QRCodeGenerator';

interface ToolStudioProps {
  initialMode: EditMode;
}

const ToolStudio: React.FC<ToolStudioProps> = ({ initialMode }) => {
    const [activeTool, setActiveTool] = useState<EditMode>(initialMode);

    useEffect(() => {
        setActiveTool(initialMode);
    }, [initialMode]);

    const renderActiveTool = () => {
        switch (activeTool) {
            case EditMode.PhotoshopOnline:
                return <PhotoshopOnline />;
            case EditMode.QRCodeGenerator:
                return <QRCodeGenerator />;
            default:
                return <PhotoshopOnline />;
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg overflow-x-auto">
                    {MENU_STRUCTURE.TOOLS.tools.map(mode => (
                        <button 
                            key={mode} 
                            onClick={() => setActiveTool(mode)} 
                            className={`flex flex-col items-center justify-center p-2 rounded-lg w-32 h-20 text-center transition-colors duration-200 ${activeTool === mode ? 'bg-primary text-white' : 'text-text-secondary hover:bg-base-200 hover:text-white'}`} 
                            title={TOOLS[mode].name}
                        >
                            <span className="w-8 h-8 flex items-center justify-center">{TOOLS[mode].icon}</span>
                            <span className="text-xs mt-1 leading-tight">{TOOLS[mode].name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                {renderActiveTool()}
            </div>
        </div>
    );
};

export default ToolStudio;
