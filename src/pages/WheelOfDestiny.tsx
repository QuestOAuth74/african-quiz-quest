import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useWheelLobby } from '@/hooks/useWheelLobby';
import { useSinglePlayerWheel } from '@/hooks/useSinglePlayerWheel';
import { OnlinePlayersList } from '@/components/wheel/OnlinePlayersList';
import { ChallengesPanel } from '@/components/wheel/ChallengesPanel';
import { GameModeSelector } from '@/components/wheel/GameModeSelector';
import TopNavigation from '@/components/TopNavigation';

export const WheelOfDestiny = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'modes' | 'challenge'>('modes');
  
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
    const session = await acceptChallenge(challengeId);
    if (session) {
      navigate(`/wheel/play/${session.id}`);
    }
  };

  const handleModeSelect = async (mode: 'single' | 'challenge' | 'live-multiplayer', difficulty?: 'easy' | 'medium' | 'hard') => {
    console.log('Mode selected:', mode, 'Difficulty:', difficulty);
    
    switch (mode) {
      case 'single':
        if (difficulty) {
          console.log('Creating single player session...');
          const session = await createSinglePlayerSession(difficulty);
          console.log('Session created:', session);
          if (session) {
            console.log('Navigating to:', `/wheel/play/${session.id}`);
            navigate(`/wheel/play/${session.id}`);
          } else {
            console.error('Failed to create session');
          }
        }
        break;
      case 'challenge':
        setCurrentView('challenge');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <TopNavigation />
        
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            🎡 Wheel of Destiny
          </h1>
          {user && (
            <p className="text-lg text-muted-foreground mb-8">
              Welcome back, {user.email}! Choose your game mode and test your African knowledge.
            </p>
          )}
        </div>

        {!user ? (
          <div className="text-center py-8">
            <Button onClick={() => navigate('/auth')} size="lg">
              Sign In
            </Button>
          </div>
        ) : currentView === 'modes' ? (
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">Choose Your Game Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <GameModeSelector onSelectMode={handleModeSelect} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('modes')}
              className="mb-6"
            >
              ← Back to Game Modes
            </Button>
            
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
      </div>
    </div>
  );
};

export default WheelOfDestiny;