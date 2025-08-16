import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ParallaxBanner } from '@/components/ParallaxBanner';
import { RotateCcw, Users, Trophy } from 'lucide-react';

const WheelOfDestiny = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [player2Email, setPlayer2Email] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleStartGame = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to play the game.",
        variant: "destructive"
      });
      return;
    }

    if (!player2Email.trim()) {
      toast({
        title: "Player 2 required",
        description: "Please enter the email of the second player.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingGame(true);
    
    // For now, navigate to game play with mock data
    // In a full implementation, you'd create the game session here
    navigate('/wheel/play', { 
      state: { 
        player1Id: user.id,
        player2Email: player2Email.trim()
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      <div className="h-64 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">Wheel of African Destiny</h1>
          <p className="text-xl">Test your knowledge of African history and culture</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Game Description */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                <RotateCcw className="h-8 w-8 text-primary" />
                <span>How to Play</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Spin the wheel and guess letters to reveal phrases related to African history, 
                culture, and geography. First player to win 3 rounds takes the crown!
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="space-y-2">
                  <RotateCcw className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Spin the Wheel</h3>
                  <p className="text-sm text-muted-foreground">
                    Spin to determine your letter's point value
                  </p>
                </div>
                <div className="space-y-2">
                  <Users className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Guess Letters</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose consonants or buy vowels to reveal the phrase
                  </p>
                </div>
                <div className="space-y-2">
                  <Trophy className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="font-semibold">Solve & Win</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to solve the puzzle and earn points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Setup */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Start New Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user ? (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Please log in to start playing
                  </p>
                  <Button onClick={() => navigate('/auth')} className="w-full">
                    Log In
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Player 1 (You)</Label>
                    <Input value={user.email || ''} disabled className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="player2Email">Player 2 Email</Label>
                    <Input
                      id="player2Email"
                      type="email"
                      value={player2Email}
                      onChange={(e) => setPlayer2Email(e.target.value)}
                      placeholder="Enter second player's email"
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleStartGame}
                    disabled={isCreatingGame || !player2Email.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isCreatingGame ? 'Starting Game...' : 'Start Game'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">African Heritage Themes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Historical Figures & Leaders</li>
                  <li>• Ancient Kingdoms & Civilizations</li>
                  <li>• Cultural Traditions & Philosophy</li>
                  <li>• Geographic Features & Landmarks</li>
                  <li>• Important Events & Battles</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Animated spinning wheel</li>
                  <li>• Two-player competitive gameplay</li>
                  <li>• Real-time score tracking</li>
                  <li>• Educational hints and context</li>
                  <li>• Best of 3 rounds format</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelOfDestiny;