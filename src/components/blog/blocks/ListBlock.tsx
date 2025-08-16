import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface ListBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const listType = block.data.type || 'unordered';
  const items = block.data.items || [''];

  const addItem = () => {
    const newItems = [...items, ''];
    onUpdate({ ...block.data, items: newItems });
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_: any, i: number) => i !== index);
      onUpdate({ ...block.data, items: newItems });
    }
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onUpdate({ ...block.data, items: newItems });
  };

  const ListComponent = listType === 'ordered' ? 'ol' : 'ul';
  const listClass = listType === 'ordered' 
    ? 'list-decimal list-inside space-y-2' 
    : 'list-disc list-inside space-y-2';

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
        <div className="flex items-center gap-3">
          <Select
            value={listType}
            onValueChange={(value) => onUpdate({ ...block.data, type: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unordered">• Bulleted</SelectItem>
              <SelectItem value="ordered">1. Numbered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {items.some((item: string) => item.trim()) && (
          <ListComponent className={listClass}>
            {items.map((item: string, index: number) => (
              item.trim() && (
                <li key={index} className="text-base leading-relaxed">
                  {item}
                </li>
              )
            ))}
          </ListComponent>
        )}

        <div className="space-y-2">
          {items.map((item: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="text-sm"
              />
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="w-full border-2 border-dashed border-muted-foreground/30 hover:border-theme-gold/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add item
          </Button>
        </div>
      </div>
    </BlockWrapper>
  );
};