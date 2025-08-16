import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface ParagraphBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.data.text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Could trigger adding new paragraph block here
    }
  };

  return (
    <BlockWrapper
      block={block}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onConvert={onConvert}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <Textarea
        ref={textareaRef}
        value={block.data.text || ''}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onKeyDown={handleKeyDown}
        placeholder="Start writing..."
        className="border-none shadow-none resize-none focus:ring-0 p-0 text-base leading-relaxed min-h-[40px]"
        style={{ height: 'auto' }}
      />
    </BlockWrapper>
  );
};