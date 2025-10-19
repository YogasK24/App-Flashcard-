
import React from 'react';
import Icon from './Icon';

interface SidebarProps {
  onClose: () => void;
  onImport: () => void;
}

interface SidebarMenuItemProps {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ icon, label, onClick, disabled }) => {
  return (
    <li>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center p-3 text-lg rounded-lg transition-colors duration-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon name={icon} className="w-6 h-6 mr-4 text-gray-500 dark:text-gray-400" />
        <span className="font-medium">{label}</span>
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onClose, onImport }) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Menu</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Tutup menu">
          <Icon name="chevronLeft" className="w-6 h-6" />
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          <SidebarMenuItem 
            icon="upload" 
            label="Impor Dek" 
            onClick={onImport} 
          />
          <SidebarMenuItem 
            icon="layoutGrid" 
            label="Dasbor Progres" 
            onClick={() => alert('Fitur Dasbor Progres akan segera hadir!')} 
            disabled={false}
          />
           <SidebarMenuItem 
            icon="tune" 
            label="Pengaturan" 
            onClick={() => alert('Fitur Pengaturan akan segera hadir!')} 
            disabled={false}
          />
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          Studi Cerdas v1.0.0
      </div>
    </>
  );
};

export default Sidebar;
