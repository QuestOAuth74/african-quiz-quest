import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SortAsc, SortDesc, TrendingUp, Clock, MessageCircle } from 'lucide-react';

interface PostSortingProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string) => void;
  onOrderChange: () => void;
}

const PostSorting = ({ sortBy, sortOrder, onSortChange, onOrderChange }: PostSortingProps) => {
  const getSortIcon = () => {
    switch (sortBy) {
      case 'upvote_count':
        return <TrendingUp className="h-4 w-4" />;
      case 'created_at':
        return <Clock className="h-4 w-4" />;
      case 'replies':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date
            </div>
          </SelectItem>
          <SelectItem value="upvote_count">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Popularity
            </div>
          </SelectItem>
          <SelectItem value="title">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Title
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onOrderChange}
        className="flex items-center gap-1"
      >
        {getSortIcon()}
        {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default PostSorting;