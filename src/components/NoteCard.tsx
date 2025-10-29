import React, { useState } from 'react';
import { Trash2, CreditCard as Edit3, X, Check, Star, Zap, Loader2, Type, Plus, Minus } from 'lucide-react';
import { Note, FontFamily, FontSize } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, title: string, content: string, image?: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  onFontChange: (id: string, fontFamily: string) => void;
  onFontSizeChange: (id: string, fontSize: string) => void;
  onToggleStar: (id: string) => void;
  onSummarize: (id: string) => Promise<string>;
  onDragStart?: (noteId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
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

const colors = [
  { name: 'white', class: 'bg-gray-700 border-2 border-gray-500' },
  { name: 'yellow', class: 'bg-yellow-800 border-2 border-yellow-600' },
  { name: 'blue', class: 'bg-blue-800 border-2 border-blue-600' },
  { name: 'green', class: 'bg-green-800 border-2 border-green-600' },
  { name: 'pink', class: 'bg-pink-800 border-2 border-pink-600' },
  { name: 'purple', class: 'bg-purple-800 border-2 border-purple-600' },
  { name: 'orange', class: 'bg-orange-800 border-2 border-orange-600' }
];

const fontFamilies = [
  { name: 'inter', label: 'Inter', class: 'font-sans' },
  { name: 'serif', label: 'Serif', class: 'font-serif' },
  { name: 'mono', label: 'Mono', class: 'font-mono' },
  { name: 'handwriting', label: 'El Yazısı', class: 'font-handwriting' },
  { name: 'display', label: 'Display', class: 'font-display' },
  { name: 'playfair', label: 'Playfair', class: 'font-playfair' },
  { name: 'fira', label: 'Fira Code', class: 'font-fira' },
  { name: 'dancing', label: 'Dancing Script', class: 'font-dancing' },
  { name: 'roboto-slab', label: 'Roboto Slab', class: 'font-roboto-slab' },
  { name: 'caveat', label: 'Caveat', class: 'font-caveat' },
  { name: 'jetbrains', label: 'JetBrains', class: 'font-jetbrains' },
  { name: 'crimson', label: 'Crimson', class: 'font-crimson' },
  { name: 'pacifico', label: 'Pacifico', class: 'font-pacifico' },
  { name: 'righteous', label: 'Righteous', class: 'font-righteous' }
];

const fontSizes = [
  { name: 'xs', label: 'Çok Küçük', class: 'text-xs' },
  { name: 'sm', label: 'Küçük', class: 'text-sm' },
  { name: 'base', label: 'Normal', class: 'text-base' },
  { name: 'lg', label: 'Büyük', class: 'text-lg' },
  { name: 'xl', label: 'Çok Büyük', class: 'text-xl' },
  { name: '2xl', label: 'Ekstra Büyük', class: 'text-2xl' },
  { name: '3xl', label: 'Maksimum', class: 'text-3xl' }
];

const getFontClass = (fontFamily?: FontFamily) => {
  const font = fontFamilies.find(f => f.name === fontFamily);
  return font?.class || 'font-sans';
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onUpdate,
  onDelete,
  onColorChange,
  onFontChange,
  onFontSizeChange,
  onToggleStar,
  onSummarize,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [image, setImage] = useState(note.image || '');
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onUpdate(note.id, title, content, image);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setImage(note.image || '');
    setIsEditing(false);
  };

  const handleContentChange = (newContent: string) => {
    onUpdate(note.id, note.title, newContent, note.image);
  };

  const applyFontToSelection = (fontClass: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // Hiçbir şey seçili değilse tüm metne uygula
      onFontChange(note.id, fontClass);
      return;
    }

    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    
    // Seçili metni span ile sarmalayıp font class ekle
    const wrappedText = `<span class="${getFontClass(fontClass as FontFamily)}">${selectedText}</span>`;
    const newContent = beforeText + wrappedText + afterText;
    
    setContent(newContent);
    onUpdate(note.id, note.title, newContent, note.image);
    setHasSelection(false);
  };

  const applyFontSizeToSelection = (fontSize: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      // Hiçbir şey seçili değilse tüm metne uygula
      onFontSizeChange(note.id, fontSize);
      return;
    }

    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);
    
    // Seçili metni span ile sarmalayıp font size class ekle
    const sizeClass = fontSizes.find(s => s.name === fontSize)?.class || 'text-base';
    const wrappedText = `<span class="${sizeClass}">${selectedText}</span>`;
    const newContent = beforeText + wrappedText + afterText;
    
    setContent(newContent);
    onUpdate(note.id, note.title, newContent, note.image);
    setHasSelection(false);
  };

  const handleTextSelection = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      // Metin seçildi
      const rect = textarea.getBoundingClientRect();
      setSelectionPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40
      });
      setHasSelection(true);
    } else {
      // Seçim kaldırıldı
      setHasSelection(false);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      // Klavye ile seçim yapıldı
      setHasSelection(true);
    } else {
      setHasSelection(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', note.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(note.id);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (onDrop) {
      onDrop(e);
    }
  };

  const handleSummarize = async () => {
    if (note.content.length < 50) {
      alert('Not içeriği çok kısa, özetleme için en az 50 karakter gerekli');
      return;
    }

    setIsSummarizing(true);
    try {
      await onSummarize(note.id);
      setShowSummary(true);
    } catch (error) {
      alert('Özetleme sırasında hata oluştu: ' + (error as Error).message);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div
      className={`${colorClasses[note.color as keyof typeof colorClasses]} p-4 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-move ${
        isDragging ? 'opacity-50 scale-95 rotate-3 z-50' : ''
      } ${isDragOver ? 'ring-4 ring-blue-400 ring-opacity-70 scale-105 bg-blue-900/20' : ''} ${getFontClass(note.fontFamily)}`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-400 text-gray-100"
            placeholder="Başlık..."
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextSelection}
            onKeyUp={handleKeyUp}
            className="w-full p-2 bg-transparent border-none outline-none resize-none placeholder-gray-400 text-gray-200"
            placeholder="Not içeriği..."
            rows={4}
            ref={contentRef}
          />
          
          {/* Seçim için Font Selector */}
          {hasSelection && (
            <div 
              className="absolute bg-gray-800 rounded-xl shadow-lg border border-gray-600 z-20 p-2 min-w-32 max-w-48 max-h-48 overflow-y-auto"
              style={{
                left: `${selectionPosition.x}px`,
                top: `${selectionPosition.y}px`
              }}
            >
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowFontSelector(!showFontSelector)}
                  className={`px-2 py-1 text-xs rounded ${showFontSelector ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Font
                </button>
                <button
                  type="button"
                  onClick={() => setShowFontSelector(false)}
                  className={`px-2 py-1 text-xs rounded ${!showFontSelector ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  Boyut
                </button>
              </div>
              
              {showFontSelector ? (
                <div>
                  <div className="text-xs text-gray-400 mb-2 px-1">Yazı Tipi:</div>
                  {fontFamilies.map((font) => (
                    <button
                      key={font.name}
                      type="button"
                      onClick={() => applyFontToSelection(font.name)}
                      className={`w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 rounded-lg text-sm ${font.class}`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-xs text-gray-400 mb-2 px-1">Yazı Boyutu:</div>
                  {fontSizes.map((size) => (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => applyFontSizeToSelection(size.name)}
                      className={`w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 rounded-lg ${size.class}`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
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
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-100 line-clamp-2 font-sans">
                {note.title || 'Başlıksız Not'}
              </h3>
            </div>
            <button
              onClick={() => onToggleStar(note.id)}
              className={`p-1 rounded-full transition-all duration-200 ${
                note.isStarred 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-gray-500 hover:text-yellow-400'
              }`}
            >
              <Star 
                size={18} 
                fill={note.isStarred ? 'currentColor' : 'none'}
              />
            </button>
          </div>
          
          {note.image && (
            <div className="mb-3">
              <img
                src={note.image}
                alt="Note attachment"
                className="w-full max-h-48 object-cover rounded-xl"
              />
            </div>
          )}
          
          {note.pdfFile && (
            <div 
              className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm cursor-pointer hover:bg-red-900/30 transition-all duration-200 hover:scale-105"
              onClick={() => {
                const url = URL.createObjectURL(note.pdfFile!);
                window.open(url, '_blank');
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-red-300 text-sm font-medium hover:text-red-200">📄 {note.pdfFile.name}</span>
                <span className="text-red-200 text-xs ml-auto">
                  {(note.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="text-xs text-red-400 mt-1 opacity-70">
                Açmak için tıklayın
              </div>
            </div>
          )}
          
          <div className="text-gray-200 text-sm">
            {note.content ? (
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            ) : (
              <span className="text-gray-400 italic">İçerik yok</span>
            )}
          </div>
          
          {/* Özet Bölümü */}
          {note.summary && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">AI Özet</span>
                </div>
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                >
                  {showSummary ? 'Gizle' : 'Göster'}
                </button>
              </div>
              {showSummary && (
                <div className="text-blue-200 text-sm">
                  {note.summary}
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-2">
              {/* Color Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColors(!showColors)}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-purple-600 border-2 border-gray-600 shadow-sm hover:scale-110 transition-transform duration-200"
                />
                
                {showColors && (
                  <div className="absolute bottom-8 left-0 flex gap-1 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-600 z-10">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          onColorChange(note.id, color.name);
                          setShowColors(false);
                        }}
                        className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform duration-200`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Font Picker */}
              <div className="relative">
                <button
                  onClick={() => {
                    // Tüm nota font uygula
                    setShowFonts(!showFonts);
                  }}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-green-600 to-blue-600 border-2 border-gray-600 shadow-sm hover:scale-110 transition-transform duration-200 flex items-center justify-center text-xs font-bold text-white"
                  title="Tüm nota yazı tipi uygula"
                >
                  A
                </button>
                
                {showFonts && (
                  <div className="absolute bottom-8 left-0 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-600 z-10 min-w-32 max-w-40 max-h-48 overflow-y-auto">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => {
                          onFontChange(note.id, font.name);
                          setShowFonts(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 rounded-lg text-sm ${font.class} ${
                          note.fontFamily === font.name ? 'bg-blue-600' : ''
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || note.content.length < 50}
                className="p-2 rounded-full hover:bg-blue-900 hover:text-blue-400 transition-colors duration-200 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title={note.content.length < 50 ? "İçerik çok kısa" : "AI ile özetle"}
              >
                {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-gray-300"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-2 rounded-full hover:bg-red-900 hover:text-red-400 transition-colors duration-200 text-gray-300"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};