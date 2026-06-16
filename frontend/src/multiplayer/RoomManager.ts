import { SupabaseClient } from '@supabase/supabase-js';
import { Room, Player, Vector3D } from '../types/index';
import axios from 'axios';

/**
 * Manages room creation, joining, and player management
 */
export class RoomManager {
  private supabase: SupabaseClient;
  private apiUrl: string;

  constructor(supabase: SupabaseClient, apiUrl: string) {
    this.supabase = supabase;
    this.apiUrl = apiUrl;
  }

  /**
   * Create a new room
   */
  public async createRoom(
    hostId: string,
    hostName: string,
    playerColor: string,
    levelId: 1 | 2
  ): Promise<Room> {
    try {
      const response = await axios.post(`${this.apiUrl}/rooms/create`, {
        hostId,
        hostName,
        playerColor,
        levelId,
      });

      return response.data as Room;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  /**
   * Join an existing room by code
   */
  public async joinRoom(
    code: string,
    playerId: string,
    playerName: string,
    playerColor: string
  ): Promise<Room> {
    try {
      const response = await axios.post(`${this.apiUrl}/rooms/join`, {
        code,
        playerId,
        playerName,
        playerColor,
      });

      return response.data as Room;
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  /**
   * Get room by ID
   */
  public async getRoom(roomId: string): Promise<Room> {
    try {
      const response = await axios.get(`${this.apiUrl}/rooms/${roomId}`);
      return response.data as Room;
    } catch (error) {
      console.error('Failed to get room:', error);
      throw error;
    }
  }

  /**
   * Get room by code
   */
  public async getRoomByCode(code: string): Promise<Room> {
    try {
      const response = await axios.get(`${this.apiUrl}/rooms/code/${code}`);
      return response.data as Room;
    } catch (error) {
      console.error('Failed to get room by code:', error);
      throw error;
    }
  }

  /**
   * Leave a room
   */
  public async leaveRoom(roomId: string, playerId: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rooms/${roomId}/leave`, { playerId });
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  /**
   * Mark player as ready
   */
  public async setPlayerReady(
    roomId: string,
    playerId: string,
    isReady: boolean
  ): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rooms/${roomId}/ready`, {
        playerId,
        isReady,
      });
    } catch (error) {
      console.error('Failed to set player ready:', error);
      throw error;
    }
  }

  /**
   * Start match (host only)
   */
  public async startMatch(roomId: string, hostId: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rooms/${roomId}/start`, { hostId });
    } catch (error) {
      console.error('Failed to start match:', error);
      throw error;
    }
  }

  /**
   * Generate unique player ID
   */
  public generatePlayerId(): string {
    return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate random player name if not provided
   */
  public generatePlayerName(): string {
    const adjectives = ['Swift', 'Brave', 'Mighty', 'Clever', 'Gentle'];
    const nouns = ['Bean', 'Runner', 'Jumper', 'Ranger', 'Warrior'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}`;
  }

  /**
   * Generate random color
   */
  public generatePlayerColor(): string {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#FFE66D', // Yellow
      '#95E1D3', // Mint
      '#C7CEEA', // Purple
      '#FF8B94', // Pink
      '#A8D8EA', // Blue
      '#AA96DA', // Lavender
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
