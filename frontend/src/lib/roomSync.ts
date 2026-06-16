/**
 * Room state synchronization using localStorage
 * Allows multiple browser tabs to sync lobby state for local testing
 */

import { Room } from '../types/index';

const ROOM_STORAGE_KEY = 'lolbeans_current_room';
const ROOM_LIST_KEY = 'lolbeans_rooms_list';

export class RoomSync {
  /**
   * Save room to localStorage and broadcast to other tabs
   */
  static saveRoom(room: Room): void {
    try {
      localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(room));
      // Broadcast event to other tabs
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: ROOM_STORAGE_KEY,
          newValue: JSON.stringify(room),
          oldValue: null,
          storageArea: localStorage,
        })
      );
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
    } catch (error) {
      console.error('Failed to clear room:', error);
    }
  }

  /**
   * Listen for room updates from other tabs
   */
  static onRoomUpdate(callback: (room: Room | null) => void): () => void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ROOM_STORAGE_KEY) {
        const room = event.newValue ? JSON.parse(event.newValue) : null;
        callback(room);
      }
    };

    // Also listen for our own dispatched events
    const handleCustomStorage = (event: Event) => {
      if (event instanceof StorageEvent && event.key === ROOM_STORAGE_KEY) {
        const room = event.newValue ? JSON.parse(event.newValue) : null;
        callback(room);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorage);

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorage);
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
