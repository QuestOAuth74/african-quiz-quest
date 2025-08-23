import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSetup } from '@/components/senet/GameSetup';
import TopNavigation from '@/components/TopNavigation';
import { FullscreenToggle } from '@/components/FullscreenToggle';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';

export default function Senet() {
  usePageTitle('Ancient Senet - The Pharaoh\'s Game');
  const navigate = useNavigate();
  
  // Enable landscape orientation for better Senet gameplay on mobile
  useScreenOrientation('any', true);

  const handleStartGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    // Generate game ID and navigate to play page
    const gameId = crypto.randomUUID();
    navigate(`/senet/play/${gameId}?difficulty=${difficulty}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950">
      <TopNavigation />
      
      <div className="absolute top-4 right-4 z-10">
        <FullscreenToggle />
      </div>

      <main className="container mx-auto px-4 py-8">
        <GameSetup onStartGame={handleStartGame} />
      </main>
    </div>
  );
}