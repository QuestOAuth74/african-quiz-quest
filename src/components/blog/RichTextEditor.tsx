import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, Strikethrough, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing...",
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Allow default behavior for paragraph creation
    }
    
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          handleFormat('underline');
          break;
      }
    }
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setSelectedText(selection.toString());
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
      setSelectedText('');
    }
  };


  return (
    <div className="relative">
      {/* Floating Toolbar */}
      {showToolbar && (
        <div className="absolute -top-12 left-0 z-10 flex items-center gap-1 bg-background border rounded-md shadow-lg p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFormat('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFormat('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFormat('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFormat('strikeThrough')}
            className="h-8 w-8 p-0"
          >
            <Strikethrough className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleFormat('formatBlock', 'code')}
            className="h-8 w-8 p-0"
          >
            <Code className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Character Count */}
      <div className="mb-2">
        <span className="text-xs text-muted-foreground">
          {value ? `${value.replace(/<[^>]*>/g, '').length} characters` : '0 characters'}
        </span>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        className={cn(
          "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "prose prose-sm max-w-none",
          "[&_p]:my-2 [&_strong]:font-semibold [&_em]:italic [&_u]:underline",
          "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
          className
        )}
        data-placeholder={placeholder}
        style={{
          minHeight: '80px',
        }}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
          }
        `
      }} />
    </div>
  );
};