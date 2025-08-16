import React from 'react';
import { RichTextEditor } from '../RichTextEditor';
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
  return (
    <BlockWrapper
      block={block}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onConvert={onConvert}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <RichTextEditor
        value={block.data.text || ''}
        onChange={(text) => onUpdate({ text })}
        placeholder="Start writing..."
        className="border-none shadow-none focus:ring-0 p-0"
      />
    </BlockWrapper>
  );
};