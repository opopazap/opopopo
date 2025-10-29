import React, { useState, useRef } from 'react';
import { Image, Mic, Square, FileText, Download, Type } from 'lucide-react';
import { FontFamily } from '../types';

interface NoteInputProps {
  onAdd: (title: string, content: string, image?: string, pdfFile?: File, fontFamily?: FontFamily) => void;
}

export function NoteInput({ onAdd }: NoteInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fontFamily, setFontFamily] = useState<FontFamily>('inter');
  const [showFonts, setShowFonts] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const getFontClass = (fontFamily: FontFamily) => {
    const font = fontFamilies.find(f => f.name === fontFamily);
    return font?.class || 'font-sans';
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      onAdd(title, content, image, pdfFile || undefined, fontFamily);
      setTitle('');
      setContent('');
      setImage(undefined);
      setPdfFile(null);
      setFontFamily('inter');
      setIsMenuOpen(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // PDF dosya adını başlık olarak ekle
      if (!title.trim()) {
        setTitle(file.name.replace('.pdf', ''));
      }
      // PDF dosya adını içeriğe ekle
      setContent(prev => prev + (prev ? '\n\n' : '') + `📄 PDF: ${file.name}`);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Sadece ses kaydını durdur
        console.log('Ses kaydı tamamlandı');

        // Stream'i kapat
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Mikrofon erişim hatası:', error);
      alert('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini kontrol edin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleExport = () => {
    if (!title.trim() && !content.trim()) {
      alert('Dışa aktarmak için başlık veya içerik gerekli');
      return;
    }

    const currentDate = new Date().toLocaleString('tr-TR');
    let textContent = '';
    
    // Başlık ekle
    if (title.trim()) {
      textContent += `${title}\n`;
      textContent += '='.repeat(title.length) + '\n\n';
    }
    
    // Tarih ekle
    textContent += `Oluşturulma Tarihi: ${currentDate}\n\n`;
    
    // İçerik ekle
    if (content.trim()) {
      textContent += `${content}\n\n`;
    }
    
    // Ek dosya bilgileri
    if (image) {
      textContent += '📷 Bu nota bir resim eklenmiştir.\n';
    }
    
    if (pdfFile) {
      textContent += `📄 PDF Dosyası: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(2)} MB)\n`;
    }

    const dataBlob = new Blob([textContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'not'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 note-input-container">
      {!isMenuOpen ? (
        <div className="text-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            + Not Ekle
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-100 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Yeni Not</h3>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setTitle('');
                setContent('');
                setImage(undefined);
                setPdfFile(null);
                setFontFamily('inter');
              }}
              className="text-gray-400 hover:text-gray-200 transition-all duration-200 hover:scale-110 p-1 rounded-full hover:bg-gray-700/50"
            >
              ✕
            </button>
          </div>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not başlığı..."
            className="w-full p-3 mb-4 bg-gray-700/50 text-gray-100 rounded-xl border border-gray-600/50 focus:border-blue-400/70 focus:outline-none placeholder-gray-400 transition-all duration-200 focus:shadow-lg focus:shadow-blue-500/10 backdrop-blur-sm font-sans font-bold"
          />
          
          <div className="mb-4">
            <div className="flex gap-3 mb-3 p-3 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-300 transition-all duration-200 hover:scale-105 hover:text-blue-400"
                title="Resim Ekle"
              >
                <Image size={16} />
              </button>
              
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-300 transition-all duration-200 hover:scale-105 hover:text-red-400"
                title="PDF Yükle"
              >
                <FileText size={16} />
              </button>
              
              <button
                type="button"
                onClick={handleMicrophoneClick}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/20' 
                    : 'hover:bg-gray-600/50 text-gray-300 hover:scale-105 hover:text-green-400'
                }`}
                title={isRecording ? "Ses Kaydını Durdur" : "Ses Kaydet"}
              >
                {isRecording ? <Square size={16} /> : <Mic size={16} />}
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFonts(!showFonts)}
                  className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-300 transition-all duration-200 hover:scale-105 hover:text-blue-400"
                  title="Yazı Tipi Seç"
                >
                  <Type size={16} />
                </button>
                
                {showFonts && (
                  <div className="absolute bottom-12 left-0 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-600 z-10 min-w-32 max-w-40 max-h-48 overflow-y-auto">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.name}
                        type="button"
                        onClick={() => {
                          setFontFamily(font.name as FontFamily);
                          setShowFonts(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors duration-200 rounded-lg text-sm ${font.class} ${
                          fontFamily === font.name ? 'bg-blue-600' : ''
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-300 transition-all duration-200 hover:scale-105 hover:text-purple-400"
                title="Notu Dışa Aktar"
              >
                <Download size={16} />
              </button>
            </div>
            
            {isRecording && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-red-300 text-sm font-medium">Ses kaydediliyor...</span>
                </div>
              </div>
            )}

            {pdfFile && (
              <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-red-400" />
                  <span className="text-red-300 text-sm font-medium">PDF yüklendi: {pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="text-red-400 hover:text-red-300 text-xs hover:scale-105 transition-all duration-200 ml-auto"
                  >
                    Kaldır
                  </button>
                </div>
                <div className="text-xs text-red-200">
                  Boyut: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
            
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Not içeriği..."
             className={`w-full p-3 bg-gray-700/50 text-gray-100 rounded-xl border border-gray-600/50 focus:border-blue-400/70 focus:outline-none resize-none placeholder-gray-400 transition-all duration-200 focus:shadow-lg focus:shadow-blue-500/10 backdrop-blur-sm ${getFontClass(fontFamily)}`}
              rows={4}
            />
          </div>
          
          {image && (
            <div className="mb-4">
              <img src={image} alt="Preview" className="max-w-full h-32 object-cover rounded-xl shadow-lg" />
              <button
                type="button"
                onClick={() => setImage(undefined)}
                className="mt-2 px-3 py-1 bg-red-500/80 text-white rounded-lg text-xs hover:bg-red-500 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Resmi Kaldır
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setTitle('');
                setContent('');
                setImage(undefined);
                setPdfFile(null);
                setFontFamily('inter');
              }}
              className="px-5 py-2 bg-gray-600/50 text-gray-200 rounded-xl hover:bg-gray-500/70 transition-all duration-200 text-sm font-medium hover:scale-105 backdrop-blur-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200 text-sm font-medium hover:scale-105 shadow-lg hover:shadow-blue-500/25"
            >
              Not Ekle
            </button>
          </div>
        </form>
      )}
    </div>
  );
}