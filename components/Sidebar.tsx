
import React from 'react';
import { EditMode } from '../types';
import { TOOLS } from '../constants';

interface SidebarProps {
  currentMode: EditMode;
  onModeChange: (mode: EditMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  return (
    <aside className="w-64 bg-base-100 p-4 flex flex-col space-y-2 border-r border-base-300">
      <div className="text-2xl font-bold text-white mb-6 px-2">AI Studio</div>
      {Object.entries(TOOLS).map(([mode, { name, icon }]) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode as EditMode)}
          className={`flex items-center space-x-3 p-3 rounded-lg text-left w-full transition-colors duration-200 ${
            currentMode === mode
              ? 'bg-primary text-white shadow-lg'
              : 'text-text-secondary hover:bg-base-200 hover:text-white'
          }`}
        >
          <span className="w-6 h-6">{icon}</span>
          <span>{name}</span>
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
