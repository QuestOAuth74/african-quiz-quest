import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWheelLobby } from '@/hooks/useWheelLobby';
import { useSinglePlayerWheel } from '@/hooks/useSinglePlayerWheel';
import { OnlinePlayersList } from '@/components/wheel/OnlinePlayersList';
import { ChallengesPanel } from '@/components/wheel/ChallengesPanel';
import { GameModeSelector } from '@/components/wheel/GameModeSelector';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Target, Trophy, Users, Home, RotateCcw } from 'lucide-react';
import wheelBannerImage from '@/assets/wheel-destiny-banner.jpg';

export const WheelOfDestiny = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'modes' | 'challenge'>('modes');
  const [creatingGame, setCreatingGame] = useState(false);
  
  const {
    onlinePlayers,
    incomingChallenges,
    outgoingChallenges,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    loading
  } = useWheelLobby();

  const { createSinglePlayerSession } = useSinglePlayerWheel();

  const handleAcceptChallenge = async (challengeId: string) => {
    await acceptChallenge(challengeId);
    // Navigation handled by real-time subscription in useWheelLobby
  };

  const handleModeSelect = async (mode: 'single' | 'challenge' | 'live-multiplayer', difficulty?: 'easy' | 'medium' | 'hard') => {
    console.log('Mode selected:', mode, 'Difficulty:', difficulty);
    
    switch (mode) {
      case 'single':
        if (difficulty) {
          setCreatingGame(true);
          try {
            console.log('Creating single player session...');
            const session = await createSinglePlayerSession(difficulty);
            console.log('Session created:', session);
            if (session) {
              console.log('Navigating to:', `/wheel/play/${session.id}`);
              navigate(`/wheel/play/${session.id}`);
            } else {
              toast({
                title: "Could not create game",
                description: "Please try again.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Failed to create session:', error);
            toast({
              title: "Could not create game",
              description: "Please try again.",
              variant: "destructive"
            });
          } finally {
            setCreatingGame(false);
          }
        }
        break;
      case 'challenge':
        setCurrentView('challenge');
        break;
    }
  };

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
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="font-semibold">Wheel of Destiny</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Welcome, {user.email?.split('@')[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {!user ? (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <RotateCcw className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Please sign in to access the Wheel of Destiny and test your African knowledge.
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          <section className="relative overflow-hidden h-[500px]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={wheelBannerImage} 
                alt="Wheel of African Destiny" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
              
              {/* Wheel Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full bg-repeat" 
                     style={{
                       backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 2px, transparent 2px)`,
                       backgroundSize: '60px 60px'
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
                        <RotateCcw className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                        Spin & Learn
                      </Badge>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
                      Wheel of
                      <span className="block text-yellow-300 text-4xl lg:text-6xl mt-2">
                        African Destiny
                      </span>
                    </h1>
                    
                    <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                      Spin the wheel, solve African history puzzles, and challenge friends in this exciting word-guessing adventure.
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-white/80 mb-8">
                      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">Word Puzzles</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Multiplayer</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Trophy className="h-5 w-5" />
                        <span className="font-medium">Competitive</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Visual Element */}
                  <div className="hidden lg:flex justify-center items-center">
                    <div className="relative">
                      {/* Large spinning wheel visualization */}
                      <div className="relative w-80 h-80">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full p-4 backdrop-blur-md border-4 border-white/20 animate-spin" style={{ animationDuration: '20s' }}>
                          {/* Wheel segments */}
                          {Array.from({ length: 8 }, (_, i) => (
                            <div
                              key={i}
                              className="absolute inset-8 bg-white/20 rounded-full"
                              style={{
                                transform: `rotate(${i * 45}deg)`,
                                clipPath: 'polygon(50% 50%, 100% 0%, 100% 50%)'
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Center hub */}
                        <div className="absolute inset-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center shadow-xl">
                          <Sparkles className="h-8 w-8 text-yellow-500" />
                        </div>
                        
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 w-4 h-8 -translate-x-1/2 -translate-y-2 bg-white rounded-b-full shadow-lg" />
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-lg rotate-12 opacity-80 animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-blue-400 rounded-lg -rotate-12 opacity-80 animate-bounce" style={{ animationDelay: '1s' }} />
                      <div className="absolute top-1/2 -right-8 w-6 h-6 bg-green-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {currentView === 'modes' ? (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Choose Your Adventure</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Test your knowledge of African history and culture through exciting word puzzles. 
                    Challenge the AI or compete against friends!
                  </p>
                </div>
                
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative">
                      <GameModeSelector onSelectMode={handleModeSelect} />
                      {creatingGame && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                          <div className="flex items-center space-x-2 text-primary">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="font-medium">Creating your game...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('modes')}
                  className="mb-6"
                >
                  ← Back to Game Modes
                </Button>
                
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Challenge Other Players</h2>
                  <p className="text-lg text-muted-foreground">
                    See who's online and send them a challenge, or accept incoming challenges from other players.
                  </p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <OnlinePlayersList 
                    players={onlinePlayers}
                    onChallenge={sendChallenge}
                    loading={loading}
                  />
                  
                  <ChallengesPanel
                    incomingChallenges={incomingChallenges}
                    outgoingChallenges={outgoingChallenges}
                    onAccept={handleAcceptChallenge}
                    onDecline={declineChallenge}
                    onCancel={cancelChallenge}
                    loading={loading}
                  />
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default WheelOfDestiny;