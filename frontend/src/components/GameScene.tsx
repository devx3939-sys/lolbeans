import React, { useEffect, useRef } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useGameStore } from '../store/gameStore';
import { BabylonSetup } from '../systems/BabylonSetup';
import { GameLoop } from '../systems/GameLoop';
import '../styles/GameScene.css';

/**
 * Main 3D game scene component
 */
const GameScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const { gameState } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon.js
    const engine = BabylonSetup.createEngine(canvasRef.current);
    const scene = BabylonSetup.createScene(engine);

    // Create game loop
    const gameLoop = new GameLoop(engine, scene);
    gameLoopRef.current = gameLoop;

    // Start render loop
    let lastUpdateTime = Date.now();
    BabylonSetup.startRenderLoop(engine, scene, (deltaTime: number) => {
      gameLoop.update(deltaTime, gameState!);

      // Sync with server every 100ms
      const now = Date.now();
      if (now - lastUpdateTime > 100) {
        const localPos = gameLoop.getLocalPlayerState();
        // TODO: Send to server via RealtimeSync
        lastUpdateTime = now;
      }
    });

    // Cleanup
    return () => {
      gameLoop.endMatch();
      engine.dispose();
    };
  }, [gameState]);

  return (
    <div className="game-scene">
      <canvas ref={canvasRef} className="babylon-canvas" />
      <div className="game-hud">
        <div className="hud-top-left">
          <div className="player-info">
            <span className="player-name">Player Name</span>
          </div>
        </div>
        <div className="hud-top-right">
          <div className="match-timer">Time: 2:45</div>
          <div className="latency">Ping: 45ms</div>
        </div>
        <div className="hud-bottom-center">
          <div className="controls-hint">
            WASD - Move | Space - Jump | Shift - Dash
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScene;
