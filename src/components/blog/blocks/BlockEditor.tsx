import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';
import { ParagraphBlock } from './ParagraphBlock';
import { HeadingBlock } from './HeadingBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { LinkBlock } from './LinkBlock';
import { FileBlock } from './FileBlock';
import { QuoteBlock } from './QuoteBlock';
import { ListBlock } from './ListBlock';
import { BlockInserter } from './BlockInserter';

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'link' | 'file' | 'quote' | 'list';
  data: any;
  order: number;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [showInserter, setShowInserter] = useState<number | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const addBlock = (type: Block['type'], position?: number) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      data: getDefaultBlockData(type),
      order: position !== undefined ? position : blocks.length
    };

    const newBlocks = [...blocks];
    if (position !== undefined) {
      // Adjust order of existing blocks
      newBlocks.forEach(block => {
        if (block.order >= position) {
          block.order += 1;
        }
      });
      newBlocks.splice(position, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    // Reorder blocks
    const reorderedBlocks = newBlocks
      .sort((a, b) => a.order - b.order)
      .map((block, index) => ({ ...block, order: index }));

    onChange(reorderedBlocks);
    setShowInserter(null);
  };

  const updateBlock = (blockId: string, data: any) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, data } : block
    );
    onChange(updatedBlocks);
  };

  const removeBlock = (blockId: string) => {
    const filteredBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    onChange(filteredBlocks);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    // Update order
    const reorderedBlocks = newBlocks.map((block, index) => ({ ...block, order: index }));
    onChange(reorderedBlocks);
  };

  const duplicateBlock = (blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: Block = {
      ...blockToDuplicate,
      id: Date.now().toString(),
      order: blockToDuplicate.order + 1
    };

    const newBlocks = [...blocks];
    // Adjust order of blocks after the duplicated one
    newBlocks.forEach(block => {
      if (block.order > blockToDuplicate.order) {
        block.order += 1;
      }
    });

    newBlocks.push(newBlock);
    const reorderedBlocks = newBlocks
      .sort((a, b) => a.order - b.order)
      .map((block, index) => ({ ...block, order: index }));

    onChange(reorderedBlocks);
  };

  const convertBlockType = (blockId: string, newType: Block['type']) => {
    const updatedBlocks = blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          type: newType,
          data: getDefaultBlockData(newType)
        };
      }
      return block;
    });
    onChange(updatedBlocks);
  };

  const getDefaultBlockData = (type: Block['type']) => {
    switch (type) {
      case 'paragraph':
        return { text: '' };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '', caption: '', alt: '' };
      case 'video':
        return { url: '', caption: '' };
      case 'link':
        return { url: '', text: '', description: '' };
      case 'file':
        return { url: '', name: '', type: '', size: 0 };
      case 'quote':
        return { text: '', author: '', source: '' };
      case 'list':
        return { items: [''], type: 'unordered' };
      default:
        return {};
    }
  };

  const renderBlock = (block: Block, index: number) => {
    const blockProps = {
      block,
      onUpdate: (data: any) => updateBlock(block.id, data),
      onRemove: () => removeBlock(block.id),
      onDuplicate: () => duplicateBlock(block.id),
      onConvert: (newType: Block['type']) => convertBlockType(block.id, newType),
      onMoveUp: index > 0 ? () => moveBlock(index, index - 1) : undefined,
      onMoveDown: index < blocks.length - 1 ? () => moveBlock(index, index + 1) : undefined,
    };

    switch (block.type) {
      case 'paragraph':
        return <ParagraphBlock key={block.id} {...blockProps} />;
      case 'heading':
        return <HeadingBlock key={block.id} {...blockProps} />;
      case 'image':
        return <ImageBlock key={block.id} {...blockProps} />;
      case 'video':
        return <VideoBlock key={block.id} {...blockProps} />;
      case 'link':
        return <LinkBlock key={block.id} {...blockProps} />;
      case 'file':
        return <FileBlock key={block.id} {...blockProps} />;
      case 'quote':
        return <QuoteBlock key={block.id} {...blockProps} />;
      case 'list':
        return <ListBlock key={block.id} {...blockProps} />;
      default:
        return null;
    }
  };

  // Initialize with a paragraph block if empty
  if (blocks.length === 0) {
    addBlock('paragraph');
    return null;
  }

  return (
    <div className="space-y-2">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => (
          <div key={block.id} className="group relative">
            {/* Block Inserter Above */}
            <div className="flex justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-theme-gold"
                onClick={() => setShowInserter(showInserter === index ? null : index)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Block Inserter Modal */}
            {showInserter === index && (
              <div className="relative mb-4">
                <BlockInserter
                  onInsert={(type) => addBlock(type, index)}
                  onClose={() => setShowInserter(null)}
                />
              </div>
            )}

            {/* Block Content */}
            {renderBlock(block, index)}
          </div>
        ))}

      {/* Final Add Block Button */}
      <div className="flex justify-center py-4">
        <Button
          variant="ghost"
          className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-theme-gold"
          onClick={() => setShowInserter(showInserter === blocks.length ? null : blocks.length)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Final Block Inserter */}
      {showInserter === blocks.length && (
        <div className="mb-4">
          <BlockInserter
            onInsert={(type) => addBlock(type)}
            onClose={() => setShowInserter(null)}
          />
        </div>
      )}
    </div>
  );
};