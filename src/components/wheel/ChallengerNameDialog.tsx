import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChallengerNameDialogProps {
  gameSessionId: string;
  isPlayer1: boolean;
  onComplete: () => void;
}

export const ChallengerNameDialog: React.FC<ChallengerNameDialogProps> = ({
  gameSessionId,
  isPlayer1,
  onComplete
}) => {
  const { user } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!playerName.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const updateField = isPlayer1 ? 'player1_name' : 'player2_name';
      await supabase
        .from('wheel_game_sessions')
        .update({ [updateField]: playerName.trim() })
        .eq('id', gameSessionId);

      onComplete();
    } catch (error) {
      console.error('Error updating player name:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your display name for this game:</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              This name will be displayed to other players during the game.
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!playerName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Start Game'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};