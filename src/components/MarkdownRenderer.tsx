import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-gray-200 text-sm whitespace-pre-wrap">
      {content}
    </div>
  );
};