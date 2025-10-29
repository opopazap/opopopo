export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  color: string;
  image?: string;
  pdfFile?: File;
  fontFamily?: FontFamily;
  fontSize?: FontSize;
  folderId?: string;
  isStarred?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange' | 'white';

export type FontFamily = 'inter' | 'serif' | 'mono' | 'handwriting' | 'display' | 'playfair' | 'fira' | 'dancing' | 'roboto-slab' | 'caveat' | 'jetbrains' | 'crimson' | 'pacifico' | 'righteous';

export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';