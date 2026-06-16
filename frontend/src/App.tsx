import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import LobbyScreen from './components/LobbyScreen';
import GameScene from './components/GameScene';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

/**
 * Main app component - routes between screens
 */
const App: React.FC = () => {
  const { ui } = useGameStore();

  const renderScreen = () => {
    switch (ui.currentScreen) {
      case 'main-menu':
        return <MainMenu />;
      case 'lobby':
        return <LobbyScreen />;
      case 'game':
        return <GameScene />;
      case 'results':
        return <ResultsScreen />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
    </div>
  );
};

export default App;
