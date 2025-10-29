import React, { useState } from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { NoteCard } from './components/NoteCard';
import { NoteInput } from './components/NoteInput';
import { SearchBar } from './components/SearchBar';
import { CreateMenu } from './components/CreateMenu';
import { FolderCard } from './components/FolderCard';
import { useNotes } from './hooks/useNotes';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'color'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSidebar, setShowSidebar] = useState(false);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const { 
    notes, 
    folders, 
    addNote, 
    addFolder, 
    updateNote, 
    deleteNote, 
    deleteFolder, 
    changeNoteColor, 
    changeNoteFont,
    moveNoteToFolder,
    toggleNoteStar,
    reorderNotes,
    searchNotes,
    summarizeNote
  } = useNotes();

  const filteredNotes = searchNotes(searchTerm).filter(note => 
    selectedFolder ? note.folderId === selectedFolder : !note.folderId
  );

  // Sıralama işlemi
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Önce yıldızlı notları sırala
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = (a.title || 'Başlıksız Not').localeCompare(b.title || 'Başlıksız Not', 'tr', { 
          sensitivity: 'base',
          numeric: true 
        });
        break;
      case 'color':
        const colorOrder = ['white', 'yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
        const aColorIndex = colorOrder.indexOf(a.color);
        const bColorIndex = colorOrder.indexOf(b.color);
        comparison = aColorIndex - bColorIndex;
        break;
      case 'date':
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCreateNote = () => {
    // Note input is now always visible, so we can scroll to it or focus it
    const noteInput = document.querySelector('.note-input-container');
    if (noteInput) {
      noteInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null = null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Sadece container'dan çıkıldığında drag over'ı temizle
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null = null) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('text/plain');
    const targetNoteId = e.dataTransfer.getData('target/note');
    
    if (noteId && draggedNoteId) {
      if (targetNoteId) {
        // Not sıralaması değiştirme
        reorderNotes(draggedNoteId, targetNoteId);
      } else {
        // Klasöre taşıma
        moveNoteToFolder(draggedNoteId, targetFolderId);
      }
      setDraggedNoteId(null);
    }
    setDragOverFolder(null);
  };

  const currentFolder = selectedFolder ? folders.find(f => f.id === selectedFolder) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Left Sidebar Trigger Area */}
      <div 
        className="fixed left-0 top-0 w-4 h-full bg-gray-700/50 hover:bg-blue-500/70 hover:w-8 z-40 transition-all duration-500 ease-in-out cursor-pointer"
        onClick={() => setShowSidebar(!showSidebar)}
        title="Kategoriler"
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2 h-8 bg-gray-400/70 rounded-full transition-all duration-500 ease-in-out hover:w-4"></div>
        </div>
      </div>

      {/* Left Sidebar Menu */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-500 ease-in-out"
          onClick={() => setShowSidebar(false)}
        />
      )}
      <div 
        className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-600 shadow-2xl z-50 transition-transform duration-500 ease-in-out ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } overflow-hidden`}
        style={{ width: '280px' }}
      >
        <div className="p-6 h-full overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-100 mb-6 border-b border-gray-600 pb-3">
            Kategoriler
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-all duration-300 ease-in-out text-gray-300 hover:scale-110"
            >
              ✕
            </button>
          </h2>
          
          {/* All Notes */}
          <div 
            className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out mb-2 hover:scale-105 ${
              !selectedFolder 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'hover:bg-gray-700 text-gray-200'
            }`}
            onClick={() => {
              setSelectedFolder(null);
              setShowSidebar(false);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="font-medium">Tüm Notlar</span>
              <span className="ml-auto text-sm opacity-70">
                {notes.filter(note => !note.folderId).length}
              </span>
            </div>
          </div>

          {/* Starred Notes */}
          <div 
            className="p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out mb-4 hover:bg-gray-700 text-gray-200 hover:scale-105"
            onClick={() => {
              // Yıldızlı notları filtreleme işlevi eklenecek
              setShowSidebar(false);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="font-medium">Yıldızlı Notlar</span>
              <span className="ml-auto text-sm opacity-70">
                {notes.filter(note => note.isStarred).length}
              </span>
            </div>
          </div>

          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                Klasörler
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 ${
                      selectedFolder === folder.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-gray-700 text-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="font-medium truncate">{folder.name}</span>
                      <span className="ml-auto text-sm opacity-70">
                        {notes.filter(note => note.folderId === folder.id).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Categories */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Renkler
            </h3>
            <div className="space-y-1">
              {[
                { name: 'Siyah', color: 'white', bgColor: 'bg-gray-600' },
                { name: 'Sarı', color: 'yellow', bgColor: 'bg-yellow-500' },
                { name: 'Mavi', color: 'blue', bgColor: 'bg-blue-500' },
                { name: 'Yeşil', color: 'green', bgColor: 'bg-green-500' },
                { name: 'Pembe', color: 'pink', bgColor: 'bg-pink-500' },
                { name: 'Mor', color: 'purple', bgColor: 'bg-purple-500' },
                { name: 'Turuncu', color: 'orange', bgColor: 'bg-orange-500' }
              ].map((colorItem) => (
                <div
                  key={colorItem.color}
                  className="p-3 rounded-lg cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-700 text-gray-200 hover:scale-105"
                  onClick={() => {
                    // Renk filtreleme işlevi eklenecek
                    setShowSidebar(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${colorItem.bgColor} rounded-full`}></div>
                    <span className="font-medium">{colorItem.name}</span>
                    <span className="ml-auto text-sm opacity-70">
                      {notes.filter(note => note.color === colorItem.color).length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Create Menu - Fixed Position */}
        <div className="fixed top-6 right-6 z-50">
          <CreateMenu onCreateFolder={addFolder} onCreateNote={handleCreateNote} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          {selectedFolder && (
            <div className="flex justify-start mb-4">
              <button
                onClick={() => setSelectedFolder(null)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-gray-300"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent pb-2">
            {currentFolder ? currentFolder.name : 'Trakly'}
          </h1>
          <p className="text-gray-300 text-lg">
            {currentFolder ? 'Klasör içeriği' : 'Düşüncelerini kaydet, organize et ve paylaş'}
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Sort Controls */}
        {(filteredNotes.length > 0 || folders.length > 0) && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-gray-400">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'color')}
                className="bg-gray-800 text-gray-200 border border-gray-600 rounded-lg px-3 py-1 focus:border-blue-400 focus:outline-none transition-all duration-300 ease-in-out hover:scale-105"
              >
                <option value="date">Tarih</option>
                <option value="title">Başlık</option>
                <option value="color">Renk</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-800 text-gray-200 border border-gray-600 rounded-lg px-3 py-1 hover:bg-gray-700 transition-all duration-300 ease-in-out hover:scale-105"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        )}

        {/* Note Input - Always visible */}
        <NoteInput onAdd={addNote} />

        {/* Folders Grid (only show when not in a folder) */}
        {!selectedFolder && folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Klasörler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  noteCount={notes.filter(note => note.folderId === folder.id).length}
                  onDelete={deleteFolder}
                  onRename={(id, newName) => {
                    // Klasör yeniden adlandırma fonksiyonu eklenecek
                  }}
                  onClick={setSelectedFolder}
                  onDrop={(folderId, noteId) => {
                    moveNoteToFolder(noteId, folderId);
                    setDraggedNoteId(null);
                  }}
                  isDragOver={dragOverFolder === folder.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <BookOpen className="mx-auto text-gray-500" size={64} />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm ? 'Not bulunamadı' : 'Henüz not yok'}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'Arama kriterlerinizi değiştirmeyi deneyin' : 'İlk notunuzu oluşturmak için sağ üstteki + butonuna tıklayın'}
            </p>
          </div>
        ) : (
          <>
            {!selectedFolder && sortedNotes.length > 0 && (
              <h2 className="text-xl font-semibold text-gray-200 mb-4">Notlar</h2>
            )}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative p-4 rounded-2xl transition-all duration-300 ${
              dragOverFolder === null && draggedNoteId ? 'bg-blue-900/20 border-2 border-dashed border-blue-400' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
          >
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onColorChange={changeNoteColor}
                onFontChange={changeNoteFont}
                onFontSizeChange={changeNoteFontSize}
                onToggleStar={toggleNoteStar}
               onSummarize={summarizeNote}
                onDragStart={setDraggedNoteId}
                onDrop={(e) => {
                  const draggedId = e.dataTransfer.getData('text/plain');
                  const targetId = e.dataTransfer.getData('target/note') || note.id;
                  if (draggedId && draggedId !== targetId) {
                    reorderNotes(draggedId, targetId);
                    setDraggedNoteId(null);
                  }
                }}
              />
            ))}
          </div>
          </>
        )}

        {/* Stats */}
        {sortedNotes.length > 0 && (
          <div className="text-center mt-8">
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-green-400">{sortedNotes.length}</span>
              <span className="text-gray-300 ml-1">Sonuç</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}