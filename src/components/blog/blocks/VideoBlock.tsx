import React from 'react';
import { Input } from '@/components/ui/input';
import { Youtube } from 'lucide-react';
import { BlockWrapper } from './BlockWrapper';
import { Block } from './BlockEditor';

interface VideoBlockProps {
  block: Block;
  onUpdate: (data: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onConvert: (type: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  onUpdate,
  onRemove,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
}) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(block.data.url || '');

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
        {videoId ? (
          <div className="space-y-3">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={block.data.caption || 'YouTube video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
            <Input
              value={block.data.caption || ''}
              onChange={(e) => onUpdate({ ...block.data, caption: e.target.value })}
              placeholder="Video caption (optional)"
              className="text-sm"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <Youtube className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Embed a YouTube video</p>
                <Input
                  value={block.data.url || ''}
                  onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                  placeholder="Paste YouTube URL"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </BlockWrapper>
  );
};