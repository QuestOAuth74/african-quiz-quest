import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import TopNavigation from '@/components/TopNavigation';
import { OwareGameModes } from '@/components/oware/OwareGameModes';
import { OwareMultiplayerLobby } from '@/components/oware/OwareMultiplayerLobby';
import { OwareGameInterface } from '@/components/oware/OwareGameInterface';
import { AudioControls } from '@/components/AudioControls';
import { usePageTitle } from '@/hooks/usePageTitle';

type GameView = 'menu' | 'single-player' | 'multiplayer' | 'tutorial' | 'game';

export default function Oware() {
  usePageTitle('Oware - African Chess Game');
  
  const [currentView, setCurrentView] = useState<GameView>('menu');
  const [gameId, setGameId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  const handleSelectMode = (mode: 'single-player' | 'multiplayer' | 'tutorial') => {
    console.log('handleSelectMode called with:', mode);
    if (mode === 'single-player') {
      // Navigate directly to single player game
      console.log('Setting currentView to game');
      setCurrentView('game');
    } else {
      setCurrentView(mode);
    }
  };

  const handleGameStart = (gameId: string, isHost: boolean) => {
    setGameId(gameId);
    setIsHost(isHost);
    setCurrentView('game');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setGameId(null);
    setIsHost(false);
  };

  const renderContent = () => {
    console.log('Current view:', currentView);
    switch (currentView) {
      case 'menu':
        return (
          <OwareGameModes 
            onSelectMode={handleSelectMode} 
          />
        );
      
      case 'multiplayer':
        return (
          <OwareMultiplayerLobby
            onBack={handleBackToMenu}
            onGameStart={handleGameStart}
          />
        );
      
      case 'tutorial':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Oware Tutorial</h1>
              <p className="text-muted-foreground">
                Interactive tutorial coming soon! For now, return to the menu to play.
              </p>
              <button 
                onClick={handleBackToMenu}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Back to Menu
              </button>
            </div>
          </div>
        );
      
      case 'game':
        return (
          <OwareGameInterface
            gameMode={gameId ? 'multiplayer' : 'single-player'}
            onBack={handleBackToMenu}
          />
        );
      
      default:
        return (
          <OwareGameModes 
            onSelectMode={handleSelectMode} 
          />
        );
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <TopNavigation />
        
        {/* Audio Controls - positioned in top-right */}
        <div className="fixed top-20 right-4 z-40">
          <AudioControls />
        </div>
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {renderContent()}
        </main>
      </div>
    </PageTransition>
  );
}