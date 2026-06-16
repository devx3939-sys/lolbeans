import * as BABYLON from '@babylonjs/core';
import { GameState, LocalPlayer, Player, Vector3D } from '../types/index';
import { InputHandler } from './InputHandler';
import { PlayerController } from './PlayerController';

/**
 * Main game loop - coordinates updates, physics, and rendering
 */
export class GameLoop {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private gameState: GameState | null = null;
  private localPlayer: PlayerController | null = null;
  private remotePlayers: Map<string, PlayerController> = new Map();
  private onUpdate: ((deltaTime: number) => void) | null = null;
  private isRunning: boolean = false;

  constructor(engine: BABYLON.Engine, scene: BABYLON.Scene) {
    this.engine = engine;
    this.scene = scene;
  }

  public startMatch(
    gameState: GameState,
    localPlayerId: string,
    onUpdate?: (deltaTime: number) => void
  ): void {
    this.gameState = gameState;
    this.onUpdate = onUpdate || (() => {});
    this.isRunning = true;

    // Create local player controller
    const playerData = gameState.players.find((p) => p.id === localPlayerId);
    if (playerData) {
      this.localPlayer = new PlayerController(
        playerData.id,
        this.babylonVector3FromVector3D(playerData.position),
        this.scene
      );
    }

    // Create remote player controllers
    gameState.players.forEach((p) => {
      if (p.id !== localPlayerId) {
        const controller = new PlayerController(
          p.id,
          this.babylonVector3FromVector3D(p.position),
          this.scene
        );
        this.remotePlayers.set(p.id, controller);
      }
    });

    InputHandler.init();
  }

  public update(deltaTime: number, gameState: GameState): void {
    if (!this.isRunning || !this.localPlayer) return;

    // Update game state
    this.gameState = gameState;

    // Update local player
    const input = InputHandler.update();
    this.localPlayer.update(deltaTime, input);

    // Interpolate remote players
    gameState.players.forEach((playerData) => {
      if (playerData.id === this.localPlayer!.id) return;

      let controller = this.remotePlayers.get(playerData.id);
      if (!controller) {
        controller = new PlayerController(
          playerData.id,
          this.babylonVector3FromVector3D(playerData.position),
          this.scene
        );
        this.remotePlayers.set(playerData.id, controller);
      }

      // Update remote player position (interpolate)
      controller.interpolateTo(
        this.babylonVector3FromVector3D(playerData.position),
        deltaTime
      );
    });

    // Call custom update callback
    this.onUpdate?.(deltaTime);
  }

  public endMatch(): void {
    this.isRunning = false;
    InputHandler.destroy();
  }

  public getLocalPlayer(): PlayerController | null {
    return this.localPlayer;
  }

  public getRemotePlayers(): Map<string, PlayerController> {
    return this.remotePlayers;
  }

  public getLocalPlayerState(): Vector3D | null {
    if (!this.localPlayer) return null;
    const pos = this.localPlayer.getMesh().position;
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  private babylonVector3FromVector3D(v: Vector3D): BABYLON.Vector3 {
    return new BABYLON.Vector3(v.x, v.y, v.z);
  }
}
