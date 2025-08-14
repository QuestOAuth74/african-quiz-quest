import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Search discussions..." }: SearchBarProps) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localTerm);
  };

  const handleClear = () => {
    setLocalTerm('');
    onSearchChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={localTerm}
          onChange={(e) => setLocalTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background"
        />
        {localTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-12 h-6 w-6 p-0 hover:bg-muted/50"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 h-8"
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;