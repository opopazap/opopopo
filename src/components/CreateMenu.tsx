import React, { useState } from 'react';
import { Plus, FolderPlus, FileText, X } from 'lucide-react';

interface CreateMenuProps {
  onCreateFolder: (name: string) => void;
  onCreateNote: () => void;
}

export const CreateMenu: React.FC<CreateMenuProps> = ({ onCreateFolder, onCreateNote }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreateFolder(folderName);
      setFolderName('');
      setShowFolderInput(false);
      setIsOpen(false);
    }
  };

  const handleCreateNote = () => {
    onCreateNote();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all duration-200 hover:scale-110"
      >
        <Plus size={24} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 bg-gray-800 rounded-xl shadow-xl border border-gray-600 py-2 min-w-48 z-50"
        >
          {!showFolderInput ? (
            <>
              <button
                onClick={() => setShowFolderInput(true)}
                className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3"
              >
                <FolderPlus size={20} className="text-blue-400" />
                Klasör Oluştur
              </button>
              <button
                onClick={handleCreateNote}
                className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3"
              >
                <FileText size={20} className="text-green-400" />
                Not Oluştur
              </button>
            </>
          ) : (
            <form onSubmit={handleCreateFolder} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-200 font-medium">Yeni Klasör</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderInput(false);
                    setFolderName('');
                    setIsOpen(false);
                  }}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Klasör adı..."
                className="w-full p-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-blue-400 focus:outline-none mb-3"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderInput(false);
                    setFolderName('');
                  }}
                  className="px-3 py-1 text-gray-400 hover:text-gray-200 text-sm"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 text-sm"
                >
                  Oluştur
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};