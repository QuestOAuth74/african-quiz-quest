import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  initialBookmarked?: boolean;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

const BookmarkButton = ({ 
  postId, 
  size = 'sm', 
  initialBookmarked = false,
  onBookmarkChange 
}: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, postId]);

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('forum_post_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (!error) {
        setIsBookmarked(!!data);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('forum_post_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) {
          toast.error('Failed to remove bookmark');
          return;
        }

        setIsBookmarked(false);
        onBookmarkChange?.(false);
        toast.success('Bookmark removed');
      } else {
        const { error } = await supabase
          .from('forum_post_bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) {
          toast.error('Failed to bookmark post');
          return;
        }

        setIsBookmarked(true);
        onBookmarkChange?.(true);
        toast.success('Post bookmarked');
      }
    } catch (error) {
      toast.error('Error updating bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleBookmark}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isLoading ? 'Loading...' : (isBookmarked ? 'Bookmarked' : 'Bookmark')}
      </span>
    </Button>
  );
};

export default BookmarkButton;