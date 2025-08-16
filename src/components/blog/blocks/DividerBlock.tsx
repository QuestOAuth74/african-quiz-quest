import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface DividerBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const dividerStyles = {
  solid: 'border-t-2 border-border',
  dashed: 'border-t-2 border-dashed border-border',
  dotted: 'border-t-2 border-dotted border-border',
  double: 'border-t-4 border-double border-border',
  gradient: 'h-px bg-gradient-to-r from-transparent via-border to-transparent',
  thick: 'border-t-4 border-border',
  stars: 'relative'
};

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const style = block.data.style || 'solid';

  const renderDivider = () => {
    if (style === 'stars') {
      return (
        <div className="flex justify-center items-center py-4">
          <span className="text-muted-foreground text-lg tracking-widest">
            ⋆ ⋆ ⋆
          </span>
        </div>
      );
    }

    return (
      <div className={`my-4 ${dividerStyles[style as keyof typeof dividerStyles]}`} />
    );
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
        <Select
          value={style}
          onValueChange={(style) => onUpdate({ ...block.data, style })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
            <SelectItem value="double">Double</SelectItem>
            <SelectItem value="thick">Thick</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
          </SelectContent>
        </Select>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-muted/30">
          {renderDivider()}
        </div>
      </div>
    </BlockWrapper>
  );
};