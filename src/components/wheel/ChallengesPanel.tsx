import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WheelGameChallenge } from '@/types/lobby';
import { Clock, CheckCircle, XCircle, Sword, Users } from 'lucide-react';
import { PlayerNameDialog } from './PlayerNameDialog';

interface ChallengesPanelProps {
  incomingChallenges: WheelGameChallenge[];
  outgoingChallenges: WheelGameChallenge[];
  onAccept: (challengeId: string, playerName: string) => void;
  onDecline: (challengeId: string) => void;
  onCancel: (challengeId: string) => void;
  loading?: boolean;
}

export const ChallengesPanel: React.FC<ChallengesPanelProps> = ({
  incomingChallenges,
  outgoingChallenges,
  onAccept,
  onDecline,
  onCancel,
  loading = false
}) => {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const handleAcceptClick = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setShowNameDialog(true);
  };

  const handleNameConfirm = (playerName: string) => {
    if (selectedChallengeId) {
      onAccept(selectedChallengeId, playerName);
    }
    setShowNameDialog(false);
    setSelectedChallengeId(null);
  };

  const handleNameCancel = () => {
    setShowNameDialog(false);
    setSelectedChallengeId(null);
  };
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds <= 0) return 'Expired';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-4">
      {/* Incoming Challenges */}
      {incomingChallenges.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <Sword className="h-5 w-5" />
              <span>Incoming Challenges</span>
              <Badge variant="destructive" className="animate-pulse">
                {incomingChallenges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomingChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-orange-200"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                      <div className="font-medium text-orange-900">
                        Challenge from Player
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-orange-600">
                        <Clock className="h-3 w-3" />
                        <span>Expires in {getTimeRemaining(challenge.expires_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptClick(challenge.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDecline(challenge.id)}
                      disabled={loading}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outgoing Challenges */}
      {outgoingChallenges.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Clock className="h-5 w-5" />
              <span>Sent Challenges</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {outgoingChallenges.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outgoingChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">
                        Challenge sent to Player
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span>Expires in {getTimeRemaining(challenge.expires_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel(challenge.id)}
                    disabled={loading}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Challenges */}
      {incomingChallenges.length === 0 && outgoingChallenges.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Sword className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active challenges</p>
              <p className="text-sm">Challenge other players to start a game!</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <PlayerNameDialog
        isOpen={showNameDialog}
        onConfirm={handleNameConfirm}
        onCancel={handleNameCancel}
        title="Enter Your Name"
        defaultName=""
      />
    </div>
  );
};