import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File as FileIcon, Download } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const FileBlock: React.FC<FileBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('blog-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Store the storage path, not the public URL
      onUpdate({
        ...block.data,
        url: fileName, // Store path for private bucket
        name: file.name,
        type: file.type,
        size: file.size
      });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className="space-y-4">
        {block.data.url ? (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-4">
              <FileIcon className="h-8 w-8 text-theme-gold flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{block.data.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {block.data.type || 'Unknown type'}
                  </span>
                  {block.data.size && (
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(block.data.size)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(block.data.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <FileIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Upload a file for download</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX, TXT, and more
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </BlockWrapper>
  );
};