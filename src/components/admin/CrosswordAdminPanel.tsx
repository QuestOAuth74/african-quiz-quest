import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CrosswordGenerator } from "@/lib/crosswordGenerator";
import { CrosswordWordData } from "@/types/crossword";
import { Puzzle, Settings, Plus, Trash2, Eye, Play, Upload } from "lucide-react";
import { CrosswordCSVUpload } from "./CrosswordCSVUpload";

export function CrosswordAdminPanel() {
  const [isPublicEnabled, setIsPublicEnabled] = useState(false);
  const [words, setWords] = useState<CrosswordWordData[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newWord, setNewWord] = useState({ word: '', clue: '', category: '', difficulty: 1 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load feature flag status
      const { data: featureData } = await supabase
        .from('feature_flags')
        .select('enabled_for_public')
        .eq('feature_name', 'crossword_puzzle')
        .single();
      
      if (featureData) {
        setIsPublicEnabled(featureData.enabled_for_public);
      }

      // Load categories from the quiz system
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Load crossword words
      const { data: wordsData } = await supabase
        .from('crossword_words')
        .select('*')
        .order('category', { ascending: true });
      
      if (wordsData) {
        setWords(wordsData);
      }

      // Load existing puzzles
      const { data: puzzlesData } = await supabase
        .from('crossword_puzzles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (puzzlesData) {
        setPuzzles(puzzlesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load crossword data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublicAccess = async () => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled_for_public: !isPublicEnabled })
        .eq('feature_name', 'crossword_puzzle');

      if (error) throw error;

      setIsPublicEnabled(!isPublicEnabled);
      toast({
        title: "Success",
        description: `Crossword puzzle ${!isPublicEnabled ? 'enabled' : 'disabled'} for public`,
      });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to update public access",
        variant: "destructive"
      });
    }
  };

  const addWord = async () => {
    if (!newWord.word || !newWord.clue || !newWord.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Validate category exists
    const validCategory = categories.find(cat => cat.name === newWord.category);
    if (!validCategory) {
      toast({
        title: "Error",
        description: "Please select a valid category",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('crossword_words')
        .insert([{
          word: newWord.word.toUpperCase(),
          clue: newWord.clue,
          category: newWord.category,
          difficulty: newWord.difficulty,
          length: newWord.word.length
        }]);

      if (error) throw error;

      setNewWord({ word: '', clue: '', category: '', difficulty: 1 });
      loadData();
      toast({
        title: "Success",
        description: "Word added successfully",
      });
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "Error",
        description: "Failed to add word",
        variant: "destructive"
      });
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crossword_words')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadData();
      toast({
        title: "Success",
        description: "Word deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting word:', error);
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive"
      });
    }
  };

  const generatePuzzle = async () => {
    const filteredWords = selectedCategory === 'all' 
      ? words.filter(w => w.is_active)
      : words.filter(w => w.is_active && w.category === selectedCategory);

    if (filteredWords.length < 5) {
      toast({
        title: "Error",
        description: "Need at least 5 active words to generate a puzzle",
        variant: "destructive"
      });
      return;
    }

    try {
      const generator = new CrosswordGenerator(15);
      const puzzle = generator.generatePuzzle(
        filteredWords, 
        `African History Crossword - ${selectedCategory === 'all' ? 'Mixed' : selectedCategory}`,
        selectedCategory === 'all' ? 'Mixed' : selectedCategory,
        3
      );

      if (!puzzle) {
        toast({
          title: "Error",
          description: "Failed to generate puzzle. Try with different words.",
          variant: "destructive"
        });
        return;
      }

      // Save puzzle to database
      const { error } = await supabase
        .from('crossword_puzzles')
        .insert({
          title: puzzle.title,
          category: puzzle.category,
          difficulty: puzzle.difficulty,
          grid_data: puzzle.grid as any,
          words_data: { words: puzzle.words, clues: puzzle.clues } as any
        });

      if (error) throw error;

      loadData();
      toast({
        title: "Success",
        description: "Crossword puzzle generated successfully!",
      });
    } catch (error) {
      console.error('Error generating puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to generate puzzle",
        variant: "destructive"
      });
    }
  };

  

  if (loading) {
    return <div>Loading crossword admin panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Puzzle className="h-6 w-6" />
            Crossword Puzzle Management
          </h2>
          <p className="text-muted-foreground">Manage crossword puzzles and word database</p>
        </div>
        <Badge variant={isPublicEnabled ? "default" : "secondary"} className="text-lg px-4 py-2">
          {isPublicEnabled ? "PUBLIC" : "ADMIN ONLY"}
        </Badge>
      </div>

      {/* Public Access Control */}
      <Card className="jeopardy-card">
        <CardHeader>
          <CardTitle className="text-theme-yellow flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Public Access</Label>
              <p className="text-sm text-muted-foreground">
                Allow all users to access crossword puzzles
              </p>
            </div>
            <Switch
              checked={isPublicEnabled}
              onCheckedChange={togglePublicAccess}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="words" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="words">Word Database</TabsTrigger>
          <TabsTrigger value="csv">CSV Import</TabsTrigger>
          <TabsTrigger value="generator">Puzzle Generator</TabsTrigger>
          <TabsTrigger value="puzzles">Generated Puzzles</TabsTrigger>
        </TabsList>

        <TabsContent value="words" className="space-y-4">
          {/* Add New Word */}
          <Card className="jeopardy-card">
            <CardHeader>
              <CardTitle className="text-theme-yellow flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Word
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Word</Label>
                  <Input
                    value={newWord.word}
                    onChange={(e) => setNewWord({...newWord, word: e.target.value.toUpperCase()})}
                    placeholder="MALI"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newWord.category} onValueChange={(value) => setNewWord({...newWord, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty (1-5)</Label>
                  <Select value={newWord.difficulty.toString()} onValueChange={(value) => setNewWord({...newWord, difficulty: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addWord} className="w-full jeopardy-gold">
                    Add Word
                  </Button>
                </div>
              </div>
              <div>
                <Label>Clue</Label>
                <Textarea
                  value={newWord.clue}
                  onChange={(e) => setNewWord({...newWord, clue: e.target.value})}
                  placeholder="Ancient West African empire known for its gold trade"
                />
              </div>
            </CardContent>
          </Card>

          {/* Words List */}
          <Card className="jeopardy-card">
            <CardHeader>
              <CardTitle className="text-theme-yellow">Word Database ({words.length} words)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {words.map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{word.word}</span>
                        <Badge variant="outline">{word.category}</Badge>
                        <Badge variant="secondary">Diff: {word.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{word.clue}</p>
                    </div>
                    <Button
                      onClick={() => deleteWord(word.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          <CrosswordCSVUpload onUploadComplete={loadData} />
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <Card className="jeopardy-card">
            <CardHeader>
              <CardTitle className="text-theme-yellow flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                Generate New Puzzle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category Filter</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generatePuzzle} className="w-full jeopardy-gold">
                <Puzzle className="h-4 w-4 mr-2" />
                Generate Crossword Puzzle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="puzzles" className="space-y-4">
          <Card className="jeopardy-card">
            <CardHeader>
              <CardTitle className="text-theme-yellow">Generated Puzzles ({puzzles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {puzzles.map((puzzle: any) => (
                  <div key={puzzle.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{puzzle.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {puzzle.category} • Difficulty: {puzzle.difficulty}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}