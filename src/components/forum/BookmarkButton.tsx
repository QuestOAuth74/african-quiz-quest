import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  postId: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const BookmarkButton = ({ postId, size = 'sm' }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark posts');
      return;
    }

    // For now, just toggle the local state
    // TODO: Implement actual bookmarking once types are updated
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Post bookmarked');
  };

  if (!user) return null;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleBookmark}
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