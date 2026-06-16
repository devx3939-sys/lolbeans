import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RoomSync } from '../lib/roomSync';
import { Room } from '../types/index';
import '../LobbyScreen.css';

/**
 * Lobby/waiting screen before match starts
 */
const LobbyScreen: React.FC = () => {
  const { currentRoom, setCurrentRoom, setScreen, localPlayer, updatePlayerReady } = useGameStore();
  const [countdown, setCountdown] = useState(10);
  const [displayRoom, setDisplayRoom] = useState<Room | null>(currentRoom);

  // Listen for room updates from other tabs
  useEffect(() => {
    const unsubscribe = RoomSync.onRoomUpdate((room) => {
      if (room) {
        setDisplayRoom(room);
        setCurrentRoom(room);
      }
    });

    return unsubscribe;
  }, [setCurrentRoom]);

  // Update display room when currentRoom changes
  useEffect(() => {
    if (currentRoom) {
      setDisplayRoom(currentRoom);
    }
  }, [currentRoom]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!displayRoom) {
    return <div className="lobby-screen">No room data</div>;
  }

  const allReady = displayRoom.players.length >= 2 && 
    displayRoom.players.every(p => p.isReady);

  const handleReady = () => {
    if (localPlayer) {
      const updatedRoom = RoomSync.setPlayerReady(localPlayer.id, !localPlayer.isReady);
      if (updatedRoom) {
        setDisplayRoom(updatedRoom);
        setCurrentRoom(updatedRoom);
        updatePlayerReady(localPlayer.id, !localPlayer.isReady);
      }
    }
  };

  return (
    <div className="lobby-screen">
      <div className="lobby-container">
        <div className="lobby-header">
          <h2>Game Lobby</h2>
          <div className="room-code">
            <span>Room: <strong>{displayRoom.code}</strong></span>
          </div>
        </div>

        <div className="level-info">
          <p>Level</p>
          <p className="level-name">{displayRoom.levelId === 1 ? '🍭 Candy Garden' : '⚡ Storm Factory'}</p>
        </div>

        <div className="players-section">
          <h3>Players ({displayRoom.players.length}/{displayRoom.maxPlayers})</h3>
          <div className="players-list">
            {displayRoom.players.map((player) => (
              <div key={player.id} className={`player-item ${player.isReady ? 'ready' : ''}`}>
                <div className="player-color" style={{ backgroundColor: player.color }} />
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className={`player-status ${player.isReady ? 'ready' : ''}`}>
                    {player.isReady ? '✓ Ready' : '⏳ Waiting'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {allReady && (
          <div className="countdown-timer">
            <div className="label">Match Starting</div>
            <div className="time">{countdown}</div>
          </div>
        )}

        <div className="lobby-actions">
          <button
            className="btn-ready"
            onClick={handleReady}
          >
            {localPlayer?.isReady ? '✓ Ready' : '⏳ Ready Up'}
          </button>
          <button className="btn-leave" onClick={() => setScreen('main-menu')}>
            Leave
          </button>
        </div>

        <div className="waiting-message">
          {allReady ? '🎮 All players ready! Starting soon...' : '⏳ Waiting for players to join and ready up...'}
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;
