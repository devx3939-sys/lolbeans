import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import '../styles/LobbyScreen.css';

/**
 * Lobby/waiting screen before match starts
 */
const LobbyScreen: React.FC = () => {
  const { currentRoom, setScreen, localPlayer } = useGameStore();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!currentRoom) {
    return <div className="lobby">No room data</div>;
  }

  const allReady = currentRoom.players.length >= 2 && 
    currentRoom.players.every(p => p.isReady);

  return (
    <div className="lobby">
      <div className="lobby-container">
        <h2>Game Lobby</h2>
        <p className="room-code">Room: <strong>{currentRoom.code}</strong></p>
        <p className="level-name">Level: <strong>{currentRoom.levelId === 1 ? 'Candy Garden' : 'Storm Factory'}</strong></p>

        <div className="players-list">
          <h3>Players ({currentRoom.players.length}/12)</h3>
          <ul>
            {currentRoom.players.map((player) => (
              <li key={player.id} className={player.isReady ? 'ready' : 'waiting'}>
                <div
                  className="player-color-dot"
                  style={{ backgroundColor: player.color }}
                />
                <span className="player-name">{player.name}</span>
                <span className="ready-status">
                  {player.isReady ? '✓ Ready' : '⏳ Waiting'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lobby-actions">
          <button className="btn btn-ready">
            {localPlayer?.isReady ? '✓ Ready' : 'Ready Up'}
          </button>
          <button className="btn btn-leave" onClick={() => setScreen('main-menu')}>
            Leave
          </button>
        </div>

        {allReady && (
          <div className="countdown">
            <p>Starting in: <strong>{countdown}s</strong></p>
            <div className="countdown-bar" style={{ width: `${(countdown / 10) * 100}%` }} />
          </div>
        )}

        <div className="lobby-info">
          <p>Waiting for more players... Minimum: 2 players</p>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
