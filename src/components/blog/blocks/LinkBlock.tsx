import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface LinkBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const LinkBlock: React.FC<LinkBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const hasValidUrl = block.data.url && block.data.url.startsWith('http');

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
        {hasValidUrl && (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <ExternalLink className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-accent hover:text-accent-dark">
                  <a 
                    href={block.data.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {block.data.text || block.data.url}
                  </a>
                </h4>
                {block.data.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {block.data.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {block.data.url}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Input
            value={block.data.url || ''}
            onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
            placeholder="https://example.com"
            className="text-sm"
          />
          <Input
            value={block.data.text || ''}
            onChange={(e) => onUpdate({ ...block.data, text: e.target.value })}
            placeholder="Link text (optional)"
            className="text-sm"
          />
          <Textarea
            value={block.data.description || ''}
            onChange={(e) => onUpdate({ ...block.data, description: e.target.value })}
            placeholder="Link description (optional)"
            className="text-sm"
            rows={2}
          />
        </div>
      </div>
    </BlockWrapper>
  );
};