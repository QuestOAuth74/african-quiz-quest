import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CrosswordPuzzle } from '@/types/crossword';
import { SavedGames } from '@/components/crossword/SavedGames';
import { 
  Puzzle, 
  Play, 
  Clock, 
  Trophy, 
  Star, 
  Search, 
  Filter,
  Grid3X3,
  Zap,
  Users,
  Home,
  Settings,
  BookOpen,
  Target
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import baobabHeaderImage from '@/assets/baobab-talks-header.png';

interface PuzzleData {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  grid_data: any;
  words_data: any;
  is_active: boolean;
  created_at: string;
}

export function Crossword() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [puzzles, setPuzzles] = useState<PuzzleData[]>([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState<PuzzleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  usePageTitle("African History Crosswords");

  useEffect(() => {
    checkAccess();
    loadPuzzles();
  }, [user]);

  useEffect(() => {
    filterPuzzles();
  }, [puzzles, searchTerm, categoryFilter, difficultyFilter]);

  const checkAccess = async () => {
    if (!user) return;

    try {
      // Check if user is admin
      const { data: adminData } = await supabase.rpc('is_admin', { user_uuid: user.id });
      setIsAdmin(!!adminData);

      if (!adminData) {
        // Check if crossword is enabled for public
        const { data: featureData } = await supabase
          .from('feature_flags')
          .select('enabled_for_public')
          .eq('feature_name', 'crossword_puzzle')
          .single();

        if (!featureData?.enabled_for_public) {
          toast({
            title: "Access Denied",
            description: "Crossword puzzles are not yet available to the public",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/');
    }
  };

  const loadPuzzles = async () => {
    try {
      const { data: puzzlesData, error } = await supabase
        .from('crossword_puzzles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPuzzles(puzzlesData || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(puzzlesData?.map(p => p.category) || [])];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error loading puzzles:', error);
      toast({
        title: "Error",
        description: "Failed to load crossword puzzles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPuzzles = () => {
    let filtered = puzzles;

    if (searchTerm) {
      filtered = filtered.filter(puzzle => 
        puzzle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        puzzle.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(puzzle => puzzle.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(puzzle => puzzle.difficulty.toString() === difficultyFilter);
    }

    setFilteredPuzzles(filtered);
  };

  const startPuzzle = (puzzleId: string) => {
    console.log('Starting puzzle with ID:', puzzleId);
    navigate(`/crossword/play/${puzzleId}`);
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "bg-green-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return "Beginner";
      case 2: return "Easy";
      case 3: return "Medium";
      case 4: return "Hard";
      case 5: return "Expert";
      default: return "Unknown";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Puzzle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Please sign in to access crossword puzzles and test your African history knowledge.
            </p>
            <Link to="/auth">
              <Button className="w-full" size="lg">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading crossword puzzles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Top Navigation */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <div className="hidden sm:block text-muted-foreground">•</div>
              <div className="flex items-center space-x-2">
                <Puzzle className="h-5 w-5 text-primary" />
                <span className="font-semibold">Crosswords</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Welcome, {user?.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={baobabHeaderImage} 
            alt="African History Crosswords" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
          
          {/* Crossword Grid Overlay Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-repeat" 
                 style={{
                   backgroundImage: `
                     linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px),
                     linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)
                   `,
                   backgroundSize: '40px 40px'
                 }} 
            />
          </div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <Grid3X3 className="h-8 w-8 text-white" />
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                    Interactive Learning
                  </Badge>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                  African History
                  <span className="block text-yellow-300 text-4xl lg:text-6xl mt-2">
                    Crosswords
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Challenge your knowledge with thoughtfully crafted puzzles spanning ancient civilizations to modern achievements.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-white/80 mb-8">
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Puzzle className="h-5 w-5" />
                    <span className="font-medium">{puzzles.length} Puzzles</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Multiple Categories</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">All Skill Levels</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Element */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Large crossword grid visualization */}
                  <div className="grid grid-cols-8 gap-1 p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                    {Array.from({ length: 64 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded border-2 transition-all duration-300 ${
                          [0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42].includes(i)
                            ? 'bg-white/90 border-white text-gray-800 flex items-center justify-center text-sm font-bold'
                            : Math.random() > 0.7
                            ? 'bg-yellow-300/80 border-yellow-200'
                            : 'bg-white/20 border-white/30'
                        }`}
                      >
                        {[0, 1, 2, 8, 9, 10, 16, 17, 18, 24, 25, 26, 32, 33, 34, 40, 41, 42].includes(i) && 
                          ['A', 'F', 'R', 'I', 'C', 'A', 'H', 'I', 'S', 'T', 'O', 'R', 'Y'][i % 13]
                        }
                      </div>
                    ))}
                  </div>
                  
                  {/* Floating puzzle pieces */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-lg rotate-12 opacity-80 animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-400 rounded-lg -rotate-12 opacity-80 animate-bounce" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -right-8 w-6 h-6 bg-green-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Saved Games Section */}
        <div className="mb-8">
          <SavedGames />
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Your Perfect Puzzle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search puzzles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="1">Beginner</SelectItem>
                  <SelectItem value="2">Easy</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Hard</SelectItem>
                  <SelectItem value="5">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setDifficultyFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Puzzles Grid */}
        {filteredPuzzles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Puzzle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Puzzles Found</h3>
              <p className="text-muted-foreground mb-4">
                {puzzles.length === 0 
                  ? "No crossword puzzles are currently available. Check back later!"
                  : "No puzzles match your current filters. Try adjusting your search criteria."
                }
              </p>
              {puzzles.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setDifficultyFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPuzzles.map((puzzle) => (
              <Card key={puzzle.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {puzzle.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < puzzle.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {puzzle.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>15-30 min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(puzzle.difficulty)}`} />
                      <span>{getDifficultyLabel(puzzle.difficulty)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => startPuzzle(puzzle.id)} 
                    className="w-full group-hover:bg-primary/90 transition-colors"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Puzzle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}