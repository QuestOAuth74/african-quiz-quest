import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkButton = ({ postId, size = 'sm' }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

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
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookmark status:', error);
        return;
      }

      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('forum_post_bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Failed to remove bookmark');
          return;
        }

        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('forum_post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          toast.error('Failed to bookmark post');
          return;
        }

        setIsBookmarked(true);
        toast.success('Post bookmarked');
      }
    } catch (error) {
      toast.error('Error updating bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleBookmark}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-primary" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </Button>
  );
};

export default BookmarkButton;