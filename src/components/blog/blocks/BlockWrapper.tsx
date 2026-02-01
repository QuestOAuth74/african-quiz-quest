import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown,
  Type,
  Heading1,
  Image,
  Youtube,
  Link,
  File,
  Quote,
  List,
  AlertCircle,
  Code,
  Minus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Block } from './BlockEditor';

interface BlockWrapperProps {
  children: React.ReactNode;
  block: Block;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  block,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const blockTypeIcons = {
    paragraph: Type,
    heading: Heading1,
    image: Image,
    video: Youtube,
    link: Link,
    file: File,
    quote: Quote,
    list: List,
    callout: AlertCircle,
    code: Code,
    divider: Minus,
  };

  const blockTypes = [
    { type: 'paragraph' as const, label: 'Paragraph' },
    { type: 'heading' as const, label: 'Heading' },
    { type: 'image' as const, label: 'Image' },
    { type: 'video' as const, label: 'Video' },
    { type: 'link' as const, label: 'Link' },
    { type: 'file' as const, label: 'File' },
    { type: 'quote' as const, label: 'Quote' },
    { type: 'list' as const, label: 'List' },
    { type: 'callout' as const, label: 'Callout' },
    { type: 'code' as const, label: 'Code Block' },
    { type: 'divider' as const, label: 'Divider' },
  ];

  // Keep toolbar visible when either hovered or dropdown is open
  const showToolbar = isHovered || isDropdownOpen;

  return (
    <div
      className={`group relative border-2 border-transparent hover:border-accent/20 rounded-lg transition-all ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block Toolbar */}
      {showToolbar && (
        <div className="absolute -top-3 right-2 z-50 bg-background border border-border rounded-md shadow-lg">
          <div className="flex items-center">
            {/* Move Up/Down */}
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onMoveUp}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
            )}
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onMoveDown}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            )}

            {/* More Options */}
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Convert to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {blockTypes
                      .filter(type => type.type !== block.type)
                      .map(({ type, label }) => {
                        const Icon = blockTypeIcons[type];
                        return (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => onConvert(type)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {label}
                          </DropdownMenuItem>
                        );
                      })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Block Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};