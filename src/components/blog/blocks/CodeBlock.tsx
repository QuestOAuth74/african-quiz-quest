import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';
import { useState } from 'react';

interface CodeBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 
  'html', 'css', 'json', 'xml', 'yaml', 'markdown', 'bash', 'sql', 'php', 'ruby', 'go'
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (block.data.code) {
      await navigator.clipboard.writeText(block.data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center gap-2">
          <Select
            value={block.data.language || 'javascript'}
            onValueChange={(language) => onUpdate({ ...block.data, language })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={block.data.filename || ''}
            onChange={(e) => onUpdate({ ...block.data, filename: e.target.value })}
            placeholder="Filename (optional)"
            className="flex-1"
          />
        </div>

        {/* Code Editor */}
        <div className="relative">
          <Textarea
            value={block.data.code || ''}
            onChange={(e) => onUpdate({ ...block.data, code: e.target.value })}
            placeholder="Enter your code..."
            className="font-mono text-sm min-h-[120px] resize-none"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
          />
          
          {/* Copy Button */}
          {block.data.code && (
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              className="absolute top-2 right-2 h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        {/* Preview */}
        {block.data.code && (
          <div className="bg-muted rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {block.data.language || 'javascript'}
                </span>
                {block.data.filename && (
                  <span className="text-xs text-muted-foreground">
                    {block.data.filename}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-6 text-xs"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="text-sm overflow-x-auto">
              <code className="font-mono">{block.data.code}</code>
            </pre>
          </div>
        )}
      </div>
    </BlockWrapper>
  );
};