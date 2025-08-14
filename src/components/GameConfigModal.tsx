import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { categories: string[]; rowCount: number }) => void;
  playerName: string;
}

interface Category {
  id: string;
  name: string;
}

export const GameConfigModal = ({ isOpen, onClose, onConfirm, playerName }: GameConfigModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories(data || []);
      // Pre-select first 6 categories
      const defaultSelected = (data || []).slice(0, 6).map(cat => cat.name);
      setSelectedCategories(defaultSelected);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories(categories.map(cat => cat.name));
  };

  const handleSelectNone = () => {
    setSelectedCategories([]);
  };

  const handleConfirm = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setLoading(true);
    onConfirm({
      categories: selectedCategories,
      rowCount
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Configure Game Challenge for {playerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Row Count Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Questions per Category</h3>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(count => (
                <Button
                  key={count}
                  variant={rowCount === count ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRowCount(count)}
                  className={rowCount === count ? 'bg-blue-600' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Categories</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="border-white/20 text-white hover:bg-white/10">
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone} className="border-white/20 text-white hover:bg-white/10">
                  Clear All
                </Button>
              </div>
            </div>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => handleCategoryToggle(category.name)}
                        className="border-white/30 data-[state=checked]:bg-blue-600"
                      />
                      <label 
                        htmlFor={category.id} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-white"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Categories Summary */}
          {selectedCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Categories ({selectedCategories.length}):</h4>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map(categoryName => (
                  <Badge key={categoryName} variant="secondary" className="bg-blue-600/20 text-blue-300">
                    {categoryName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={selectedCategories.length === 0 || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Sending Challenge...' : 'Send Challenge'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};