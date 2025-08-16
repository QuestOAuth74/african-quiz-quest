import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filePath);

      onUpdate({
        ...block.data,
        url: data.publicUrl,
        alt: file.name.split('.')[0]
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
      <div className="space-y-4">
        {block.data.url ? (
          <div className="space-y-3">
            <img
              src={block.data.url}
              alt={block.data.alt || block.data.caption || 'Blog image'}
              className="max-w-full h-auto rounded-lg shadow-sm"
            />
            <div className="grid grid-cols-1 gap-2">
              <Input
                value={block.data.caption || ''}
                onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
                placeholder="Image caption (optional)"
                className="text-sm"
              />
              <Input
                value={block.data.alt || ''}
                onChange={(e) => onUpdate({ ...block.data, alt: e.target.value })}
                placeholder="Alt text for accessibility"
                className="text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Change Image
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Add an image to your post</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <div className="text-xs text-muted-foreground">or</div>
                  <Input
                    value={block.data.url || ''}
                    onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                    placeholder="Paste image URL"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </BlockWrapper>
  );
};