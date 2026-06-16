import { BABYLON } from "@babylonjs/core";

/**
 * Core game types and interfaces
 */

// Player states
export type PlayerStatus = "ACTIVE" | "FINISHED" | "ELIMINATED" | "SPECTATING" | "DISCONNECTED";
export type RoomStatus = "LOBBY" | "STARTING" | "IN_PROGRESS" | "ENDED";

/**
 * Represents a player in a room
 */
export interface Player {
  id: string;
  name: string;
  roomId: string;
  color: string; // hex color
  position: Vector3D;
  velocity: Vector3D;
  isReady: boolean;
  status: PlayerStatus;
  finishTime: number | null; // milliseconds
  connectedAt: number; // timestamp
  rank?: number;
}

/**
 * Represents a game room/lobby
 */
export interface Room {
  id: string;
  code: string; // 5-char code like "AB12C"
  hostId: string;
  levelId: 1 | 2;
  status: RoomStatus;
  players: Player[];
  maxPlayers: number;
  createdAt: number;
  expiresAt: number;
}

/**
 * Local player state (what we control)
 */
export interface LocalPlayer {
  id: string;
  name: string;
  color: string;
  position: Vector3D;
  velocity: Vector3D;
  isJumping: boolean;
  isGrounded: boolean;
  currentCheckpoint: number; // which checkpoint player is at
}

/**
 * Input from keyboard/gamepad
 */
export interface InputState {
  moveX: number; // -1 to 1 (A/D or left/right)
  moveY: number; // -1 to 1 (W/S or up/down)
  jump: boolean;
  dive: boolean;
  isMobile: boolean;
}

/**
 * 3D Vector (position, velocity, etc)
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Match state synchronized across all clients
 */
export interface GameState {
  roomId: string;
  levelId: 1 | 2;
  timeElapsed: number; // milliseconds
  timeLimit: number; // milliseconds
  status: RoomStatus;
  players: Player[];
  matchResults?: MatchResult[];
}

/**
 * Final results of a match
 */
export interface MatchResult {
  playerId: string;
  playerName: string;
  rank: number;
  finishTime: number;
  qualified: boolean;
  reason?: "finished" | "eliminated" | "timeout" | "disconnected";
}

/**
 * Level configuration
 */
export interface LevelConfig {
  id: 1 | 2;
  name: string;
  description: string;
  theme: string;
  spawnPoints: Vector3D[];
  checkpoints: Checkpoint[];
  hazards: Hazard[];
  finishLinePos: Vector3D;
  bounds: {
    min: Vector3D;
    max: Vector3D;
  };
  timeLimit: number; // milliseconds
}

/**
 * Checkpoint in a level
 */
export interface Checkpoint {
  id: number;
  position: Vector3D;
  radius: number;
  nextCheckpointId: number;
}

/**
 * Hazard in the level
 */
export interface Hazard {
  id: string;
  type: "moving-obstacle" | "spinning-blade" | "platform" | "fan" | "conveyor";
  position: Vector3D;
  scale: Vector3D;
  data: Record<string, any>; // type-specific data
}

/**
 * Collision event
 */
export interface CollisionEvent {
  type: "player-hazard" | "player-player" | "player-finishline";
  playerId?: string;
  otherPlayerId?: string;
  hazardId?: string;
  impact: Vector3D; // direction of impact
  force: number; // magnitude
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  finishTime: number;
  qualified: boolean;
}

/**
 * UI State for screen management
 */
export type ScreenName = 
  | "main-menu" 
  | "room-creation" 
  | "room-join" 
  | "lobby" 
  | "loading" 
  | "game" 
  | "results" 
  | "settings";

export interface UIState {
  currentScreen: ScreenName;
  loading: boolean;
  error: string | null;
  notification: string | null;
}
