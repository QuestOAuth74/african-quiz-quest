import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Quote as QuoteIcon } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface QuoteBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
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
      <div className="space-y-4">
        {block.data.text && (
          <blockquote className="border-l-4 border-accent pl-6 py-4 bg-muted/30 rounded-r-lg">
            <QuoteIcon className="h-6 w-6 text-accent mb-2" />
            <p className="text-lg italic font-medium leading-relaxed">
              "{block.data.text}"
            </p>
            {(block.data.author || block.data.source) && (
              <footer className="mt-3 text-sm text-muted-foreground">
                {block.data.author && <cite>— {block.data.author}</cite>}
                {block.data.source && (
                  <span>
                    {block.data.author ? ', ' : '— '}
                    {block.data.source}
                  </span>
                )}
              </footer>
            )}
          </blockquote>
        )}

        <div className="space-y-3">
          <Textarea
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
            placeholder="Enter your quote..."
            className="text-lg italic"
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={block.data.author || ''}
              onChange={(e) => onUpdate({ ...block.data, author: e.target.value })}
              placeholder="Author (optional)"
              className="text-sm"
            />
            <Input
              value={block.data.source || ''}
              onChange={(e) => onUpdate({ ...block.data, source: e.target.value })}
              placeholder="Source (optional)"
              className="text-sm"
            />
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};