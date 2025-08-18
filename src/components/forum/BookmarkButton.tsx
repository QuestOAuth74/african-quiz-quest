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
      console.log(`BookmarkButton: Checking bookmark status for user ${user.id} and post ${postId}`);
      checkBookmarkStatus();
    } else {
      setIsBookmarked(false);
    }
  }, [user, postId]);

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      console.log(`BookmarkButton: Querying database for user ${user.id} and post ${postId}`);
      const { data, error } = await supabase
        .from('forum_post_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) {
        console.error('BookmarkButton: Database error:', error);
        toast.error('Failed to check bookmark status');
        return;
      }

      const isBookmarked = !!data;
      console.log(`BookmarkButton: Post ${postId} is ${isBookmarked ? 'bookmarked' : 'not bookmarked'} for user ${user.id}`);
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.error('BookmarkButton: Error checking bookmark status:', error);
      toast.error('Error checking bookmark status');
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    // Optimistic update for better UX
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);
    setIsLoading(true);
    
    try {
      if (previousState) {
        console.log(`BookmarkButton: Removing bookmark for user ${user.id} and post ${postId}`);
        const { error, data } = await supabase
          .from('forum_post_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .select();

        if (error) {
          console.error('BookmarkButton: Delete error:', error);
          setIsBookmarked(previousState); // Revert optimistic update
          toast.error('Failed to remove bookmark');
          return;
        }

        console.log(`BookmarkButton: Successfully removed bookmark. Deleted records:`, data);
        onBookmarkChange?.(false);
        toast.success('Bookmark removed');
      } else {
        console.log(`BookmarkButton: Adding bookmark for user ${user.id} and post ${postId}`);
        const { error, data } = await supabase
          .from('forum_post_bookmarks')
          .insert({
            user_id: user.id,
            post_id: postId
          })
          .select();

        if (error) {
          console.error('BookmarkButton: Insert error:', error);
          setIsBookmarked(previousState); // Revert optimistic update
          if (error.code === '23505') {
            toast.error('Post is already bookmarked');
          } else {
            toast.error('Failed to bookmark post');
          }
          return;
        }

        console.log(`BookmarkButton: Successfully added bookmark. Created record:`, data);
        onBookmarkChange?.(true);
        toast.success('Post bookmarked');
      }
    } catch (error) {
      console.error('BookmarkButton: Unexpected error:', error);
      setIsBookmarked(previousState); // Revert optimistic update
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