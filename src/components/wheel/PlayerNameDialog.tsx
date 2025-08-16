import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PlayerNameDialogProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  title: string;
  defaultName?: string;
}

export const PlayerNameDialog: React.FC<PlayerNameDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  defaultName = ''
}) => {
  const [playerName, setPlayerName] = useState(defaultName);

  const handleConfirm = () => {
    const trimmedName = playerName.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!playerName.trim()}
            >
              Join Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};