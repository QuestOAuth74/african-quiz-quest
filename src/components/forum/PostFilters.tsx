import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, TrendingUp, Clock, Filter, X } from 'lucide-react';

interface PostFiltersProps {
  timeFilter: string;
  userFilter: string;
  popularityFilter: string;
  onTimeFilterChange: (filter: string) => void;
  onUserFilterChange: (filter: string) => void;
  onPopularityFilterChange: (filter: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const PostFilters = ({
  timeFilter,
  userFilter,
  popularityFilter,
  onTimeFilterChange,
  onUserFilterChange,
  onPopularityFilterChange,
  onClearFilters,
  activeFiltersCount
}: PostFiltersProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Time Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Time Period
          </label>
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Content Type
          </label>
          <Select value={userFilter} onValueChange={onUserFilterChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All posts</SelectItem>
              <SelectItem value="my-posts">My posts</SelectItem>
              <SelectItem value="my-replies">My replies</SelectItem>
              <SelectItem value="following">Following</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Popularity Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Activity Level
          </label>
          <Select value={popularityFilter} onValueChange={onPopularityFilterChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activity</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="hot">Hot discussions</SelectItem>
              <SelectItem value="no-replies">No replies yet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PostFilters;