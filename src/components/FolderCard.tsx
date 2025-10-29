import React, { useState } from 'react';
import { Folder, Trash2, CreditCard as Edit3, X, Check } from 'lucide-react';
import { Folder as FolderType } from '../types';

interface FolderCardProps {
  folder: FolderType;
  noteCount: number;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onClick: (folderId: string) => void;
  onDrop?: (folderId: string, noteId: string) => void;
  isDragOver?: boolean;
}

const colorClasses = {
  yellow: 'bg-yellow-900 border-yellow-700',
  blue: 'bg-blue-900 border-blue-700',
  green: 'bg-green-900 border-green-700',
  pink: 'bg-pink-900 border-pink-700',
  purple: 'bg-purple-900 border-purple-700',
  orange: 'bg-orange-900 border-orange-700',
  white: 'bg-gray-800 border-gray-600'
};

export const FolderCard: React.FC<FolderCardProps> = ({ 
  folder, 
  noteCount, 
  onDelete, 
  onRename, 
  onClick,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropAnimation, setDropAnimation] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onRename(folder.id, name.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(folder.name);
    setIsEditing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDropAnimation(true);
    const noteId = e.dataTransfer.getData('text/plain');
    if (onDrop && noteId) {
      onDrop(folder.id, noteId);
      // Animasyonu sıfırla
      setTimeout(() => setDropAnimation(false), 600);
    }
  };

  return (
    <div 
      className={`${colorClasses[folder.color as keyof typeof colorClasses]} p-4 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-pointer ${
        isDragOver ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105 bg-blue-900/20' : ''
      } ${
        dropAnimation ? 'animate-pulse ring-4 ring-green-400 ring-opacity-70 scale-110' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-400 text-gray-100"
            placeholder="Klasör adı..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-gray-300"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-gray-300"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => onClick(folder.id)}>
          <div className="flex items-center gap-3 mb-3">
            <Folder size={32} className="text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-100">
                {folder.name}
              </h3>
              <p className="text-sm text-gray-400">
                {noteCount} not
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-gray-300"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
              }}
              className="p-2 rounded-full hover:bg-red-900 hover:text-red-400 transition-colors duration-200 text-gray-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};