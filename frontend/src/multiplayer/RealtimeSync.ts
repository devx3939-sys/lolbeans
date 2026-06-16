import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { GameState, Player, Vector3D } from '../types/index';

/**
 * Handles real-time state synchronization with Supabase
 */
export class RealtimeSync {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private roomId: string | null = null;
  private playerId: string | null = null;
  private stateUpdateCallback: ((state: GameState) => void) | null = null;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'disconnected';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  public connect(
    roomId: string,
    playerId: string,
    onStateUpdate: (state: GameState) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomId = roomId;
      this.playerId = playerId;
      this.stateUpdateCallback = onStateUpdate;
      this.connectionStatus = 'connecting';

      try {
        // Subscribe to room channel
        this.channel = this.supabase
          .channel(`room:${roomId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'player_positions',
              filter: `room_id=eq.${roomId}`,
            },
            (payload) => {
              this.handlePlayerPositionUpdate(payload);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'rooms',
              filter: `id=eq.${roomId}`,
            },
            (payload) => {
              this.handleRoomStateUpdate(payload);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              this.connectionStatus = 'connected';
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              this.connectionStatus = 'disconnected';
              reject(new Error(`Channel error: ${status}`));
            }
          });
      } catch (error) {
        this.connectionStatus = 'disconnected';
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.connectionStatus = 'disconnected';
  }

  public broadcastPlayerState(
    playerId: string,
    position: Vector3D,
    velocity: Vector3D
  ): Promise<void> {
    if (!this.roomId) return Promise.reject('Not connected to room');

    return this.supabase
      .from('player_positions')
      .upsert({
        player_id: playerId,
        room_id: this.roomId,
        x: position.x,
        y: position.y,
        z: position.z,
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,
        updated_at: new Date().toISOString(),
      })
      .then(() => {})
      .catch((error) => {
        console.error('Failed to broadcast player state:', error);
      });
  }

  public updatePlayerReady(playerId: string, isReady: boolean): Promise<void> {
    if (!this.roomId) return Promise.reject('Not connected to room');

    return this.supabase
      .from('players_in_room')
      .update({ is_ready: isReady })
      .eq('player_id', playerId)
      .eq('room_id', this.roomId)
      .then(() => {})
      .catch((error) => {
        console.error('Failed to update ready status:', error);
      });
  }

  public finishMatch(
    playerId: string,
    finishTime: number,
    qualified: boolean
  ): Promise<void> {
    if (!this.roomId) return Promise.reject('Not connected to room');

    return this.supabase
      .from('players_in_room')
      .update({
        finish_time: finishTime,
        status: 'FINISHED',
      })
      .eq('player_id', playerId)
      .eq('room_id', this.roomId)
      .then(() => {})
      .catch((error) => {
        console.error('Failed to update finish time:', error);
      });
  }

  public getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' {
    return this.connectionStatus;
  }

  private handlePlayerPositionUpdate(payload: any): void {
    // Handle incoming player position updates
    // This would be processed by the game loop for remote player interpolation
    console.log('Player position update:', payload);
  }

  private handleRoomStateUpdate(payload: any): void {
    // Handle room state changes (e.g., match started, ended)
    console.log('Room state update:', payload);
  }
}
