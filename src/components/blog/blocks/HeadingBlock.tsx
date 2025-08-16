import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const level = block.data.level || 2;
  const text = block.data.text || '';

  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1: return 'text-3xl font-bold';
      case 2: return 'text-2xl font-bold';
      case 3: return 'text-xl font-bold';
      default: return 'text-2xl font-bold';
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
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Select
            value={level.toString()}
            onValueChange={(value) => onUpdate({ ...block.data, level: parseInt(value) })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Input
          value={text}
          onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
          placeholder="Write heading..."
          className={`border-none shadow-none focus:ring-0 p-0 ${getHeadingClass(level)}`}
        />
      </div>
    </BlockWrapper>
  );
};