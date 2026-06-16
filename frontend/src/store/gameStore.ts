import { create } from 'zustand';
import {
  GameState,
  LocalPlayer,
  Player,
  Room,
  ScreenName,
  UIState,
  Vector3D,
} from '../types/index';

/**
 * Main game state store using Zustand
 * Manages all global game state
 */

interface GameStore {
  // UI state
  ui: UIState;
  setScreen: (screen: ScreenName) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotification: (notification: string | null) => void;

  // Room/Lobby state
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  updateRoomPlayers: (players: Player[]) => void;
  updatePlayerReady: (playerId: string, isReady: boolean) => void;

  // Local player state
  localPlayer: LocalPlayer | null;
  setLocalPlayer: (player: LocalPlayer) => void;
  updateLocalPlayerPosition: (position: Vector3D) => void;
  updateLocalPlayerVelocity: (velocity: Vector3D) => void;

  // Game state during match
  gameState: GameState | null;
  setGameState: (state: GameState) => void;

  // Multiplayer state
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
  latency: number;
  setLatency: (latency: number) => void;

  // Settings
  playerName: string;
  setPlayerName: (name: string) => void;
  playerColor: string;
  setPlayerColor: (color: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Utility
  reset: () => void;
}

const initialUIState: UIState = {
  currentScreen: 'main-menu',
  loading: false,
  error: null,
  notification: null,
};

export const useGameStore = create<GameStore>((set) => ({
  // UI
  ui: initialUIState,
  setScreen: (screen: ScreenName) =>
    set((state) => ({ ui: { ...state.ui, currentScreen: screen } })),
  setLoading: (loading: boolean) =>
    set((state) => ({ ui: { ...state.ui, loading } })),
  setError: (error: string | null) =>
    set((state) => ({ ui: { ...state.ui, error } })),
  setNotification: (notification: string | null) =>
    set((state) => ({ ui: { ...state.ui, notification } })),

  // Room
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),
  updateRoomPlayers: (players) =>
    set((state) => ({
      currentRoom: state.currentRoom
        ? { ...state.currentRoom, players }
        : null,
    })),
  updatePlayerReady: (playerId, isReady) =>
    set((state) => {
      if (!state.currentRoom) return state;
      return {
        currentRoom: {
          ...state.currentRoom,
          players: state.currentRoom.players.map((p) =>
            p.id === playerId ? { ...p, isReady } : p
          ),
        },
      };
    }),

  // Local player
  localPlayer: null,
  setLocalPlayer: (player) => set({ localPlayer: player }),
  updateLocalPlayerPosition: (position) =>
    set((state) => ({
      localPlayer: state.localPlayer
        ? { ...state.localPlayer, position }
        : null,
    })),
  updateLocalPlayerVelocity: (velocity) =>
    set((state) => ({
      localPlayer: state.localPlayer
        ? { ...state.localPlayer, velocity }
        : null,
    })),

  // Game state
  gameState: null,
  setGameState: (state) => set({ gameState: state }),

  // Network
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),
  latency: 0,
  setLatency: (latency) => set({ latency }),

  // Settings
  playerName: 'Player',
  setPlayerName: (name) => set({ playerName: name }),
  playerColor: '#FF6B6B',
  setPlayerColor: (color) => set({ playerColor: color }),
  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  // Utility
  reset: () =>
    set({
      ui: initialUIState,
      currentRoom: null,
      localPlayer: null,
      gameState: null,
      isConnected: false,
    }),
}));
