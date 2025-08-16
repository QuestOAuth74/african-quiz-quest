import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useWheelLobby } from '@/hooks/useWheelLobby';
import { OnlinePlayersList } from '@/components/wheel/OnlinePlayersList';
import { ChallengesPanel } from '@/components/wheel/ChallengesPanel';
import { RotateCcw, Users, Trophy, ArrowLeft } from 'lucide-react';

const WheelOfDestiny = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    onlinePlayers,
    incomingChallenges,
    outgoingChallenges,
    loading,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge
  } = useWheelLobby();

  const handleAcceptChallenge = async (challengeId: string) => {
    const gameSession = await acceptChallenge(challengeId);
    if (gameSession) {
      navigate('/wheel/play', { 
        state: { 
          gameSessionId: gameSession.id
        }
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
                  <RotateCcw className="h-8 w-8 text-primary" />
                  <span>Wheel of African Destiny</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Please log in to join the game lobby
                </p>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Log In
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <RotateCcw className="h-8 w-8" />
                <span>Wheel of African Destiny</span>
              </h1>
              <p className="text-orange-100 mt-1">Game Lobby</p>
            </div>
            
            <div className="text-right">
              <p className="font-medium">Welcome, {user.email}</p>
              <p className="text-sm text-orange-100">Ready to play!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Game Description */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Challenge another player to a word puzzle duel! Spin the wheel and guess letters to reveal phrases related to African history, culture, and geography.
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
                    First to win 3 rounds takes the crown
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Online Players */}
            <div>
              <OnlinePlayersList
                players={onlinePlayers}
                onChallenge={sendChallenge}
                loading={loading}
              />
            </div>

            {/* Right Column: Challenges */}
            <div>
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

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Game Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Getting Started:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Wait for other players to come online</li>
                    <li>• Send a challenge to any available player</li>
                    <li>• Accept incoming challenges to start playing</li>
                    <li>• Challenges expire after 2 minutes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Gameplay:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Take turns spinning the wheel</li>
                    <li>• Guess consonants to earn points</li>
                    <li>• Buy vowels for $250 each</li>
                    <li>• Solve the puzzle to win the round</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WheelOfDestiny;