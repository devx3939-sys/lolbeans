/**
 * Room state synchronization using BroadcastChannel and localStorage
 * Allows multiple browser tabs to sync lobby state in real-time
 */

import { Room } from '../types/index';

const ROOM_STORAGE_KEY = 'lolbeans_current_room';
const CHANNEL_NAME = 'lolbeans_room_sync';

// Global listener registry
const listeners = new Set<(room: Room | null) => void>();
let broadcastChannel: BroadcastChannel | null = null;

// Initialize BroadcastChannel if supported
function initBroadcastChannel() {
  if (typeof BroadcastChannel !== 'undefined' && !broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'ROOM_UPDATE') {
          notifyListeners(event.data.room);
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not available:', error);
      broadcastChannel = null;
    }
  }
}

function notifyListeners(room: Room | null) {
  listeners.forEach(callback => {
    try {
      callback(room);
    } catch (error) {
      console.error('Error in room update callback:', error);
    }
  });
}

export class RoomSync {
  /**
   * Save room to localStorage and broadcast to all tabs
   */
  static saveRoom(room: Room): void {
    try {
      localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(room));
      
      // Notify local listeners immediately
      notifyListeners(room);
      
      // Broadcast to other tabs via BroadcastChannel
      initBroadcastChannel();
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'ROOM_UPDATE',
          room: room,
        });
      }
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  }

  /**
   * Get room from localStorage
   */
  static getRoom(): Room | null {
    try {
      const roomData = localStorage.getItem(ROOM_STORAGE_KEY);
      return roomData ? JSON.parse(roomData) : null;
    } catch (error) {
      console.error('Failed to get room:', error);
      return null;
    }
  }

  /**
   * Clear room from localStorage
   */
  static clearRoom(): void {
    try {
      localStorage.removeItem(ROOM_STORAGE_KEY);
      notifyListeners(null);
      
      // Broadcast to other tabs
      initBroadcastChannel();
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'ROOM_UPDATE',
          room: null,
        });
      }
    } catch (error) {
      console.error('Failed to clear room:', error);
    }
  }

  /**
   * Listen for room updates from all sources
   */
  static onRoomUpdate(callback: (room: Room | null) => void): () => void {
    initBroadcastChannel();
    
    // Add listener to registry
    listeners.add(callback);

    // Setup polling as fallback for same-tab updates
    let lastRoom = RoomSync.getRoom();
    let lastJson = JSON.stringify(lastRoom);
    
    const pollInterval = setInterval(() => {
      try {
        const currentRoom = RoomSync.getRoom();
        const currentJson = JSON.stringify(currentRoom);
        
        if (currentJson !== lastJson) {
          lastRoom = currentRoom;
          lastJson = currentJson;
          notifyListeners(currentRoom);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 200); // Poll every 200ms for responsiveness

    // Cleanup function
    return () => {
      listeners.delete(callback);
      clearInterval(pollInterval);
    };
  }

  /**
   * Add player to existing room
   */
  static addPlayerToRoom(playerId: string, playerName: string, playerColor: string): Room | null {
    try {
      const room = RoomSync.getRoom();
      if (!room) return null;

      // Check if player already exists
      if (room.players.some(p => p.id === playerId)) {
        return room;
      }

      // Add new player
      const updatedRoom: Room = {
        ...room,
        players: [
          ...room.players,
          {
            id: playerId,
            name: playerName,
            color: playerColor,
            status: 'joined',
            isReady: false,
            finishTime: null,
          },
        ],
      };

      RoomSync.saveRoom(updatedRoom);
      return updatedRoom;
    } catch (error) {
      console.error('Failed to add player to room:', error);
      return null;
    }
  }

  /**
   * Mark player as ready
   */
  static setPlayerReady(playerId: string, isReady: boolean): Room | null {
    try {
      const room = RoomSync.getRoom();
      if (!room) return null;

      const updatedRoom: Room = {
        ...room,
        players: room.players.map(p =>
          p.id === playerId ? { ...p, isReady } : p
        ),
      };

      RoomSync.saveRoom(updatedRoom);
      return updatedRoom;
    } catch (error) {
      console.error('Failed to set player ready:', error);
      return null;
    }
  }
}
