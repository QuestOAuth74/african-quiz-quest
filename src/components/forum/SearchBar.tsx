import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultCount?: number;
}

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search discussions...", 
  isLoading = false,
  resultCount 
}: SearchBarProps) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);

  // Debounced search - search as user types with a delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(localTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [localTerm, onSearchChange]);

  // Sync with external searchTerm changes
  useEffect(() => {
    setLocalTerm(searchTerm);
  }, [searchTerm]);

  const handleClear = () => {
    setLocalTerm('');
    onSearchChange('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localTerm);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Input
            value={localTerm}
            onChange={(e) => setLocalTerm(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10 bg-background/80 backdrop-blur-sm border-border/50 focus:bg-background rounded-2xl h-12 text-base"
          />
          {localTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 h-8 w-8 p-0 hover:bg-muted/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      
      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              Searching for: "{searchTerm}"
            </Badge>
            {resultCount !== undefined && (
              <span className="text-muted-foreground">
                {resultCount} result{resultCount !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-xs rounded-full"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;