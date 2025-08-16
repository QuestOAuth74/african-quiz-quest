import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '../RichTextEditor';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';
import { AlertTriangle, Info, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface CalloutBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const calloutTypes = {
  info: { icon: Info, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-800' },
  warning: { icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' },
  success: { icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800' },
  error: { icon: XCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' },
  tip: { icon: Lightbulb, bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-800' }
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const calloutType = block.data.type || 'info';
  const IconComponent = calloutTypes[calloutType as keyof typeof calloutTypes]?.icon || Info;
  const styles = calloutTypes[calloutType as keyof typeof calloutTypes] || calloutTypes.info;

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
        <div className="flex items-center gap-2">
          <Select
            value={calloutType}
            onValueChange={(type) => onUpdate({ ...block.data, type })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="tip">Tip</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={block.data.title || ''}
            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
            placeholder="Callout title (optional)"
            className="flex-1"
          />
        </div>

        {/* Preview */}
        <div className={`p-4 rounded-lg border-l-4 ${styles.bgColor} ${styles.borderColor}`}>
          <div className="flex items-start gap-3">
            <IconComponent className={`h-5 w-5 mt-0.5 ${styles.textColor}`} />
            <div className="flex-1">
              {block.data.title && (
                <h4 className={`font-semibold mb-2 ${styles.textColor}`}>
                  {block.data.title}
                </h4>
              )}
              <div className={styles.textColor}>
                <RichTextEditor
                  value={block.data.content || ''}
                  onChange={(content) => onUpdate({ ...block.data, content })}
                  placeholder="Enter callout content..."
                  className="border-none shadow-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};