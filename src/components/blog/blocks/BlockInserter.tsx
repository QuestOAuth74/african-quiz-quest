import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Type, 
  Heading1, 
  Image, 
  Youtube, 
  Link, 
  File, 
  Quote, 
  List,
  X 
} from 'lucide-react';
import { Block } from './BlockEditor';

interface BlockInserterProps {
  onInsert: (type: Block['type']) => void;
  onClose: () => void;
}

export const BlockInserter: React.FC<BlockInserterProps> = ({ onInsert, onClose }) => {
  const blockTypes = [
    {
      type: 'paragraph' as const,
      icon: Type,
      label: 'Paragraph',
      description: 'Write your thoughts with plain text'
    },
    {
      type: 'heading' as const,
      icon: Heading1,
      label: 'Heading',
      description: 'Create section headers and titles'
    },
    {
      type: 'image' as const,
      icon: Image,
      label: 'Image',
      description: 'Upload or embed images'
    },
    {
      type: 'video' as const,
      icon: Youtube,
      label: 'Video',
      description: 'Embed YouTube videos'
    },
    {
      type: 'link' as const,
      icon: Link,
      label: 'Link',
      description: 'Add rich external links'
    },
    {
      type: 'file' as const,
      icon: File,
      label: 'File',
      description: 'Upload and share files'
    },
    {
      type: 'quote' as const,
      icon: Quote,
      label: 'Quote',
      description: 'Highlight important quotes'
    },
    {
      type: 'list' as const,
      icon: List,
      label: 'List',
      description: 'Create bulleted or numbered lists'
    }
  ];

  return (
    <Card className="border-theme-gold/20 shadow-lg relative z-10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Choose a block type</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {blockTypes.map(({ type, icon: Icon, label, description }) => (
            <Button
              key={type}
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-theme-gold/10 hover:border-theme-gold/20 border border-transparent"
              onClick={() => onInsert(type)}
            >
              <Icon className="h-5 w-5 text-theme-gold" />
              <div className="text-center">
                <div className="text-xs font-medium">{label}</div>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};