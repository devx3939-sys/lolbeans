import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RoomManager } from '../multiplayer/RoomManager';
import { supabase } from '../lib/supabase';
import '../MainMenu.css';

/**
 * Main menu screen
 */
const MainMenu: React.FC = () => {
  const {
    setScreen,
    setPlayerName,
    setPlayerColor,
    setCurrentRoom,
    setLoading,
    setError,
    setLocalPlayer,
  } = useGameStore();

  const [playerName, setLocalPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#667eea');
  const [showSettings, setShowSettings] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoadingLocal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const roomManager = new RoomManager(supabase, API_URL);

  const playerColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];

  const generateRandomName = () => {
    const names = ['Bean', 'Hop', 'Zoom', 'Dash', 'Glide', 'Rush', 'Speed', 'Flash'];
    const adjectives = ['Swift', 'Mighty', 'Quick', 'Bold', 'Wild', 'Crazy', 'Happy', 'Lucky'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    return `${adj}${name}`;
  };

  const handleRandomizePlayer = () => {
    const randomName = generateRandomName();
    const randomColor = playerColors[Math.floor(Math.random() * playerColors.length)];
    setLocalPlayerName(randomName);
    setSelectedColor(randomColor);
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoadingLocal(true);
    setError(null);

    try {
      const playerId = `player_${Date.now()}`;
      
      // Create mock room for local testing (without backend)
      const mockRoom = {
        id: `room_${Date.now()}`,
        code: Math.random().toString(36).substring(2, 7).toUpperCase(),
        hostId: playerId,
        levelId: 1,
        status: 'LOBBY' as const,
        maxPlayers: 12,
        players: [
          {
            id: playerId,
            name: playerName,
            color: selectedColor,
            status: 'joined' as const,
            isReady: false,
            finishTime: null,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setPlayerName(playerName);
      setPlayerColor(selectedColor);
      setCurrentRoom(mockRoom);
      setLocalPlayer({
        id: playerId,
        name: playerName,
        color: selectedColor,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        isReady: false,
        finishTime: null,
      });

      setScreen('lobby');
    } catch (error) {
      console.error('Failed to create room:', error);
      setError('Failed to create room. Check console for details.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleJustPlay = async () => {
    if (!playerName.trim()) {
      setError('Please enter a name');
      return;
    }

    setIsLoadingLocal(true);
    setError(null);

    try {
      const playerId = `player_${Date.now()}`;

      // Create mock room for quick play
      const mockRoom = {
        id: `room_${Date.now()}`,
        code: Math.random().toString(36).substring(2, 7).toUpperCase(),
        hostId: playerId,
        levelId: Math.random() > 0.5 ? 1 : 2, // Random level
        status: 'LOBBY' as const,
        maxPlayers: 12,
        players: [
          {
            id: playerId,
            name: playerName,
            color: selectedColor,
            status: 'joined' as const,
            isReady: false,
            finishTime: null,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setPlayerName(playerName);
      setPlayerColor(selectedColor);
      setCurrentRoom(mockRoom);
      setLocalPlayer({
        id: playerId,
        name: playerName,
        color: selectedColor,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        isReady: true, // Auto-ready for quick play
        finishTime: null,
      });

      setScreen('lobby');
    } catch (error) {
      console.error('Failed to start quick play:', error);
      setError('Failed to start quick play.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter a name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoadingLocal(true);
    setError(null);

    try {
      const playerId = `player_${Date.now()}`;
      
      // Create mock room join for testing
      const mockRoom = {
        id: `room_${roomCode}`,
        code: roomCode.toUpperCase(),
        hostId: `host_${roomCode}`,
        levelId: 1,
        status: 'LOBBY' as const,
        maxPlayers: 12,
        players: [
          {
            id: `host_${roomCode}`,
            name: 'Host',
            color: '#667eea',
            status: 'joined' as const,
            isReady: false,
            finishTime: null,
          },
          {
            id: playerId,
            name: playerName,
            color: selectedColor,
            status: 'joined' as const,
            isReady: false,
            finishTime: null,
          },
        ],
        createdAt: new Date().toISOString(),
      };

      setPlayerName(playerName);
      setPlayerColor(selectedColor);
      setCurrentRoom(mockRoom);
      setLocalPlayer({
        id: playerId,
        name: playerName,
        color: selectedColor,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        isReady: false,
        finishTime: null,
      });

      setShowJoinModal(false);
      setScreen('lobby');
    } catch (error) {
      console.error('Failed to join room:', error);
      setError('Failed to join room. Check code and try again.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <div className="main-menu">
      <div className="main-menu-container">
        <h1>🫘 LOLBEANS</h1>
        <p className="subtitle">Chaotic Multiplayer Obstacle Racing</p>

        {/* Error Display */}
        {false && (
          <div style={{
            background: '#ff6b6b',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {false}
          </div>
        )}

        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setLocalPlayerName(e.target.value)}
            placeholder="Enter your name"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
          />
        </div>

        <div className="form-group">
          <label>Your Color</label>
          <div className="color-picker">
            {playerColors.map((color) => (
              <div
                key={color}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="button-group full">
          <button
            className="btn-primary"
            onClick={handleRandomizePlayer}
            disabled={isLoading}
          >
            🎲 Randomize
          </button>
        </div>

        <div className="button-group">
          <button
            className="btn-primary"
            onClick={handleCreateRoom}
            disabled={!playerName.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : '🏗️ Create Room'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowJoinModal(!showJoinModal)}
            disabled={isLoading}
          >
            🚪 Join Room
          </button>
        </div>

        <div className="button-group full">
          <button
            className="btn-primary"
            onClick={handleJustPlay}
            disabled={!playerName.trim() || isLoading}
            style={{
              background: 'linear-gradient(135deg, #FF9A56 0%, #FFD89B 100%)',
            }}
          >
            {isLoading ? 'Starting...' : '⚡ Just Play!'}
          </button>
        </div>

        {showJoinModal && (
          <div className="form-group">
            <label>Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 5-char code"
              maxLength={5}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <div className="button-group full">
              <button
                className="btn-primary"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim() || isLoading}
              >
                {isLoading ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="settings-panel active">
            <h3>Settings</h3>
            <label>
              <input type="checkbox" defaultChecked /> Sound Effects
            </label>
            <label>
              <input type="checkbox" defaultChecked /> Music
            </label>
          </div>
        )}

        <div className="button-group full">
          <button
            className="btn-secondary"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
