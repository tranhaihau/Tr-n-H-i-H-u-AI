import React, { useMemo } from 'react';
import { EditMode } from '../types';
import { TOOLS, MENU_STRUCTURE } from '../constants';

interface SidebarProps {
  currentMode: EditMode;
  onModeChange: (mode: EditMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
    const modeToCategoryMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const categoryKey in MENU_STRUCTURE) {
            for (const tool of MENU_STRUCTURE[categoryKey].tools) {
                map[tool] = categoryKey;
            }
        }
        return map;
    }, []);

    const currentCategory = modeToCategoryMap[currentMode];

    const simpleMenu = useMemo(() => Object.entries(MENU_STRUCTURE).map(([categoryKey, { name, tools }]) => ({
        key: categoryKey,
        name: name,
        icon: TOOLS[tools[0]].icon,
        mode: tools[0] 
    })), []);


  return (
    <aside className="w-64 bg-base-100 p-4 flex flex-col space-y-2 border-r border-base-300 overflow-y-auto">
      <div className="text-2xl font-bold text-white mb-6 px-2">AI của THH</div>
      {simpleMenu.map(item => {
        const isActive = currentCategory === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onModeChange(item.mode)}
            className={`flex items-center space-x-4 p-3 rounded-lg text-left w-full transition-colors duration-200 ${
              isActive
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:bg-base-200 hover:text-white'
            }`}
          >
            <span className="w-6 h-6 flex-shrink-0">{item.icon}</span>
            <span className="font-semibold">{item.name}</span>
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
