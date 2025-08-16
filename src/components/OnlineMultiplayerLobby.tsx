import { useState } from 'react';
import { ArrowLeft, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveLobby } from './LiveLobby';

interface OnlineMultiplayerLobbyProps {
  onBack: () => void;
  onGameStart: (roomId: string, players: any[]) => void;
  gameConfig: {
    categories: string[];
    rowCount: number;
  };
}

export const OnlineMultiplayerLobby = ({ 
  onBack, 
  onGameStart, 
  gameConfig 
}: OnlineMultiplayerLobbyProps) => {
  const [showLiveLobby, setShowLiveLobby] = useState(false);

  const handleEnterLiveLobby = () => {
    setShowLiveLobby(true);
  };

  if (showLiveLobby) {
    return (
      <LiveLobby
        onBack={() => setShowLiveLobby(false)}
        onMatchFound={onGameStart}
        gameConfig={gameConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Online Multiplayer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button
                onClick={handleEnterLiveLobby}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Zap className="w-4 h-4 mr-2" />
                Enter Live Lobby
              </Button>
              <div className="text-center text-white/70 text-sm mt-2">
                Find and match with other players instantly
              </div>
            </div>

            <Button
              onClick={onBack}
              variant="outline"
              className="w-full text-white border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game Modes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};