import { useState, useEffect } from 'react';
import { Note, NoteColor, Folder } from '../types';
import { supabase } from '../lib/supabase';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      setNotes(parsedNotes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      })));
    }

    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders);
      setFolders(parsedFolders.map((folder: any) => ({
        ...folder,
        createdAt: new Date(folder.createdAt)
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  const addNote = (title: string, content: string, image?: string, pdfFile?: File, fontFamily?: FontFamily) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      color: 'yellow',
      image: image || undefined,
      pdfFile: pdfFile || undefined,
      fontFamily: fontFamily || 'inter',
      fontSize: 'base',
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: name.trim(),
      color: 'blue',
      createdAt: new Date()
    };
    setFolders(prev => [newFolder, ...prev]);
  };

  const updateNote = (id: string, title: string, content: string, image?: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, title: title.trim(), content: content.trim(), image: image || undefined, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
    // Klasördeki notları da sil
    setNotes(prev => prev.filter(note => note.folderId !== id));
  };

  const changeNoteColor = (id: string, color: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, color: color as NoteColor, updatedAt: new Date() }
        : note
    ));
  };

  const changeNoteFont = (id: string, fontFamily: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, fontFamily: fontFamily as FontFamily, updatedAt: new Date() }
        : note
    ));
  };

  const changeNoteFontSize = (id: string, fontSize: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, fontSize: fontSize as FontSize, updatedAt: new Date() }
        : note
    ));
  };

  const moveNoteToFolder = (noteId: string, folderId: string | null) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId
        ? { ...note, folderId: folderId || undefined, updatedAt: new Date() }
        : note
    ));
  };

  const toggleNoteStar = (id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, isStarred: !note.isStarred, updatedAt: new Date() }
        : note
    ));
  };

  const reorderNotes = (draggedId: string, targetId: string) => {
    setNotes(prev => {
      const draggedIndex = prev.findIndex(note => note.id === draggedId);
      const targetIndex = prev.findIndex(note => note.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const newNotes = [...prev];
      const [draggedNote] = newNotes.splice(draggedIndex, 1);
      newNotes.splice(targetIndex, 0, draggedNote);
      
      return newNotes;
    });
  };
  const searchNotes = (searchTerm: string) => {
    if (!searchTerm.trim()) return notes;
    
    const term = searchTerm.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      (note.summary && note.summary.toLowerCase().includes(term))
    );
  };

  const summarizeNote = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note || !note.content || note.content.length < 50) {
      throw new Error('Not içeriği çok kısa veya bulunamadı');
    }

    // Check if Supabase is properly configured
    if (!import.meta.env.VITE_SUPABASE_URL || 
        !import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co' ||
        import.meta.env.VITE_SUPABASE_ANON_KEY === 'your-anon-key') {
      throw new Error('AI özetleme özelliği için Supabase yapılandırması gerekli. Lütfen sağ üstteki ayarlar simgesinden Supabase butonuna tıklayın.');
    }

    try {
      const { data, error } = await supabase.functions.invoke('summarize-note', {
        body: { content: note.content }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('AI özetleme servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
      }

      const summary = data?.summary || 'Özet oluşturulamadı';
      setNotes(prev => prev.map(n =>
        n.id === id
          ? { ...n, summary, updatedAt: new Date() }
          : n
      ));

      return summary;
    } catch (error) {
      console.error('Özetleme hatası:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('AI özetleme sırasında bir hata oluştu');
    }
  };
  return {
    notes,
    folders,
    addNote,
    addFolder,
    updateNote,
    deleteNote,
    deleteFolder,
    changeNoteColor,
    changeNoteFont,
    changeNoteFontSize,
    moveNoteToFolder,
    toggleNoteStar,
    reorderNotes,
    searchNotes,
    summarizeNote
  };
};