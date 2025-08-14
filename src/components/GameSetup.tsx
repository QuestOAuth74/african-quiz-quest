import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

type QuestionFilter = 'all' | 'fresh' | 'correct' | 'incorrect';

interface GameSetupProps {
  gameMode: 'single' | 'multiplayer';
  playerCount?: number;
  onBack: () => void;
  onStartGame: (selectedCategories: Category[], rowCount: number, questionFilter: QuestionFilter, playerNames?: string[]) => void;
}

interface QuestionCounts {
  all: number;
  fresh: number;
  correct: number;
  incorrect: number;
}

const GameSetup = ({ gameMode, playerCount, onBack, onStartGame }: GameSetupProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(5);
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState<QuestionCounts>({ all: 0, fresh: 0, correct: 0, incorrect: 0 });
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: playerCount || 2 }, (_, i) => `Player ${i + 1}`)
  );
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      loadQuestionCounts();
    }
  }, [selectedCategories]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
        // Auto-select first 5 categories by default
        setSelectedCategories(data.slice(0, Math.min(5, data.length)).map(cat => cat.id));
      } else {
        // Show message about no categories
        toast({
          title: "No Categories Available",
          description: "Please create categories first using the admin panel before starting a game.",
          variant: "destructive",
        });
        setCategories([]);
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please create categories using the admin panel.",
        variant: "destructive",
      });
      setCategories([]);
      setSelectedCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get total questions for selected categories
      const { data: allQuestions, error: allError } = await supabase
        .from('questions')
        .select('id')
        .in('category_id', selectedCategories);

      if (allError) throw allError;
      const allCount = allQuestions?.length || 0;

      if (!user) {
        setQuestionCounts({ all: allCount, fresh: allCount, correct: 0, incorrect: 0 });
        return;
      }

      // Get user's attempted questions
      const { data: attempts, error: attemptsError } = await supabase
        .from('user_question_attempts')
        .select('question_id, answered_correctly')
        .eq('user_id', user.id);

      if (attemptsError) throw attemptsError;

      const attemptedQuestionIds = new Set(attempts?.map(a => a.question_id) || []);
      const correctQuestionIds = new Set(
        attempts?.filter(a => a.answered_correctly).map(a => a.question_id) || []
      );
      const incorrectQuestionIds = new Set(
        attempts?.filter(a => !a.answered_correctly).map(a => a.question_id) || []
      );

      const freshCount = allQuestions?.filter(q => !attemptedQuestionIds.has(q.id)).length || 0;
      const correctCount = allQuestions?.filter(q => correctQuestionIds.has(q.id)).length || 0;
      const incorrectCount = allQuestions?.filter(q => incorrectQuestionIds.has(q.id)).length || 0;

      setQuestionCounts({
        all: allCount,
        fresh: freshCount,
        correct: correctCount,
        incorrect: incorrectCount
      });
    } catch (error) {
      console.error('Error loading question counts:', error);
      setQuestionCounts({ all: 0, fresh: 0, correct: 0, incorrect: 0 });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCategories(categories.map(cat => cat.id));
  };

  const handleSelectNone = () => {
    setSelectedCategories([]);
  };

  const handleStartGame = () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one category to play.",
        variant: "destructive",
      });
      return;
    }

    const selectedCategoryData = categories.filter(cat => 
      selectedCategories.includes(cat.id)
    );
    
    onStartGame(selectedCategoryData, rowCount, questionFilter, gameMode === 'multiplayer' ? playerNames : undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p className="text-theme-yellow font-orbitron">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="jeopardy-button border-theme-yellow/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-orbitron font-black text-3xl md:text-4xl gradient-text">
                Game Setup
              </h1>
              <p className="text-theme-yellow-light font-exo">
                Configure your {gameMode === 'single' ? 'single player' : `${playerCount || 2} player`} game
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories Selection */}
            <div className="lg:col-span-2">
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-xl font-orbitron text-accent">
                    Select Categories
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSelectAll}
                      variant="outline"
                      size="sm"
                      className="jeopardy-button text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={handleSelectNone}
                      variant="outline"
                      size="sm"
                      className="jeopardy-button text-xs"
                    >
                      Select None
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-theme-yellow/30 hover:bg-theme-yellow/5 transition-colors"
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                          className="border-theme-yellow data-[state=checked]:bg-theme-yellow data-[state=checked]:border-theme-yellow"
                        />
                        <Label
                          htmlFor={category.id}
                          className="text-sm font-medium text-card-foreground cursor-pointer flex-1"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Configuration */}
            <div className="space-y-6">
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron text-accent">
                    Questions Per Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={rowCount.toString()} onValueChange={(value) => setRowCount(parseInt(value))}>
                    <SelectTrigger className="jeopardy-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-theme-yellow/30">
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="4">4 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="6">6 Questions</SelectItem>
                      <SelectItem value="7">7 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Point values: {Array.from({length: rowCount}, (_, i) => `$${(i + 1) * 100}`).join(', ')}
                  </p>
                </CardContent>
              </Card>
              
              {/* Player Names for Multiplayer */}
              {gameMode === 'multiplayer' && (
                <Card className="jeopardy-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-orbitron text-accent flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Player Names
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {playerNames.map((name, index) => (
                      <div key={index}>
                        <Label htmlFor={`player-${index}`} className="text-sm font-medium text-muted-foreground">
                          Player {index + 1}
                        </Label>
                        <Input
                          id={`player-${index}`}
                          value={name}
                          onChange={(e) => {
                            const newNames = [...playerNames];
                            newNames[index] = e.target.value || `Player ${index + 1}`;
                            setPlayerNames(newNames);
                          }}
                          placeholder={`Player ${index + 1}`}
                          className="jeopardy-button mt-1"
                          maxLength={20}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* Question Filter Selection */}
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron text-accent">
                    Question Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={questionFilter} onValueChange={(value: QuestionFilter) => setQuestionFilter(value)}>
                    <SelectTrigger className="jeopardy-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-theme-yellow/30">
                      <SelectItem value="all">All Questions ({questionCounts.all})</SelectItem>
                      <SelectItem value="fresh">Fresh Questions Only ({questionCounts.fresh})</SelectItem>
                      <SelectItem value="correct">Previously Correct ({questionCounts.correct})</SelectItem>
                      <SelectItem value="incorrect">Previously Wrong ({questionCounts.incorrect})</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-2">
                    {questionFilter === 'all' && 'Include all available questions'}
                    {questionFilter === 'fresh' && 'Only questions you haven\'t attempted'}
                    {questionFilter === 'correct' && 'Questions you answered correctly before'}
                    {questionFilter === 'incorrect' && 'Questions you answered incorrectly before'}
                  </div>
                </CardContent>
              </Card>

              {/* Game Summary */}
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron text-accent">
                    Game Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mode</Label>
                    <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                      {gameMode === 'single' ? 'Single Player' : `${playerCount || 2} Players`}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      {selectedCategories.length} selected
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Questions</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      {selectedCategories.length * rowCount}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Max Points</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      ${selectedCategories.length * rowCount * 100 * rowCount / 2}
                    </p>
                  </div>

                  <Button
                    onClick={handleStartGame}
                    disabled={selectedCategories.length === 0}
                    className="w-full jeopardy-button mt-6"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;