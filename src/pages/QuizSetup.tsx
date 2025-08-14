import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
}

const QuizSetup = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      loadCategories();
    }
  }, [user, authLoading, navigate]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
        // Auto-select first 3 categories by default
        setSelectedCategories(data.slice(0, Math.min(3, data.length)).map(cat => cat.id));
      } else {
        toast({
          title: "No Categories Available",
          description: "Please contact admin to add quiz categories.",
          variant: "destructive",
        });
        setCategories([]);
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
      setCategories([]);
      setSelectedCategories([]);
    } finally {
      setLoading(false);
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

  const handleStartQuiz = () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "No Categories Selected",
        description: "Please select at least one category to start the quiz.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to quiz with parameters
    const params = new URLSearchParams({
      categories: selectedCategories.join(','),
      count: questionCount.toString()
    });
    navigate(`/quiz?${params.toString()}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p className="text-theme-yellow font-orbitron">Loading quiz setup...</p>
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
              onClick={() => navigate('/')}
              variant="outline"
              className="jeopardy-button border-theme-yellow/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-orbitron font-black text-3xl md:text-4xl gradient-text flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-theme-yellow" />
                Quiz Setup
              </h1>
              <p className="text-theme-yellow-light font-exo">
                Configure your personalized quiz experience
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

            {/* Quiz Configuration */}
            <div className="space-y-6">
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron text-accent">
                    Number of Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger className="jeopardy-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-theme-yellow/30">
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Choose how many questions you want to answer
                  </p>
                </CardContent>
              </Card>

              {/* Quiz Summary */}
              <Card className="jeopardy-card">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron text-accent">
                    Quiz Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mode</Label>
                    <Badge variant="secondary" className="ml-2 bg-accent text-accent-foreground">
                      Quiz Mode
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Categories</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      {selectedCategories.length} selected
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Questions</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      {questionCount} questions
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Points per Question</Label>
                    <p className="text-sm text-theme-yellow font-medium">
                      10 points each
                    </p>
                  </div>

                  <Button
                    onClick={handleStartQuiz}
                    disabled={selectedCategories.length === 0}
                    className="w-full jeopardy-button mt-6"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
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

export default QuizSetup;