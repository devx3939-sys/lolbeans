import * as BABYLON from '@babylonjs/core';
import { InputState, Vector3D } from '../types/index';

/**
 * Controls a single player character
 * Handles movement, physics, and animation
 */
export class PlayerController {
  private id: string;
  private mesh: BABYLON.Mesh;
  private position: BABYLON.Vector3;
  private velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  private isJumping: boolean = false;
  private isGrounded: boolean = true;
  private groundRayLength: number = 0.8;
  private moveSpeed: number = 8; // m/s
  private jumpForce: number = 12; // m/s
  private scene: BABYLON.Scene;

  constructor(id: string, position: BABYLON.Vector3, scene: BABYLON.Scene) {
    this.id = id;
    this.scene = scene;
    this.position = position.clone();

    // Create mesh (temporary sphere)
    this.mesh = BABYLON.MeshBuilder.CreateSphere(
      `player-${id}`,
      { diameter: 1.5 },
      scene
    );
    this.mesh.position = this.position;

    // Material
    const material = new BABYLON.StandardMaterial(`player-${id}-mat`, scene);
    material.diffuse = new BABYLON.Color3(
      Math.random(),
      Math.random(),
      Math.random()
    );
    this.mesh.material = material;

    this.mesh.checkCollisions = true;
  }

  public update(deltaTime: number, input: InputState): void {
    // Apply gravity
    this.velocity.y -= 9.8 * deltaTime;

    // Check if grounded
    this.checkIfGrounded();

    // Apply movement input
    this.applyMovement(input, deltaTime);

    // Handle jump
    if (input.jump && this.isGrounded) {
      this.jump();
    }

    // Update position
    this.position.addInPlace(this.velocity.scale(deltaTime));

    // Clamp to reasonable bounds
    this.clampToBounds();

    // Update mesh
    this.mesh.position = this.position.clone();
  }

  public interpolateTo(targetPos: BABYLON.Vector3, deltaTime: number): void {
    // Smooth interpolation for remote players
    const interpolationSpeed = 5;
    this.mesh.position = BABYLON.Vector3.Lerp(
      this.mesh.position,
      targetPos,
      interpolationSpeed * deltaTime
    );
    this.position = this.mesh.position.clone();
  }

  private applyMovement(input: InputState, deltaTime: number): void {
    // Calculate desired direction
    const forward = BABYLON.Vector3.Forward();
    const right = BABYLON.Vector3.Right();

    // Create movement vector
    const moveDir = forward.scale(input.moveY).add(right.scale(input.moveX));

    // Apply movement (only horizontal)
    const moveForce = moveDir.scale(this.moveSpeed * deltaTime);
    this.velocity.x += moveForce.x;
    this.velocity.z += moveForce.z;

    // Apply friction
    this.velocity.x *= 0.95;
    this.velocity.z *= 0.95;
  }

  private jump(): void {
    if (this.isGrounded && !this.isJumping) {
      this.velocity.y = this.jumpForce;
      this.isJumping = true;
      this.isGrounded = false;
    }
  }

  private checkIfGrounded(): void {
    // Cast ray downward
    const rayOrigin = this.position.clone();
    const rayDirection = BABYLON.Vector3.Down();
    const rayLength = this.groundRayLength;
    const ray = new BABYLON.Ray(rayOrigin, rayDirection, rayLength);

    const hit = this.scene.pickWithRay(ray, (mesh) => mesh !== this.mesh);

    if (hit && hit.hit) {
      this.isGrounded = true;
      this.isJumping = false;
      // Snap to ground if close
      this.position.y = hit.pickedPoint?.y ?? this.position.y;
      this.velocity.y = Math.max(0, this.velocity.y);
    } else {
      this.isGrounded = false;
    }
  }

  private clampToBounds(): void {
    const MAX_BOUNDS = 100;
    if (
      Math.abs(this.position.x) > MAX_BOUNDS ||
      Math.abs(this.position.z) > MAX_BOUNDS ||
      this.position.y < -20
    ) {
      this.respawn();
    }
  }

  private respawn(): void {
    this.position = BABYLON.Vector3.Zero();
    this.velocity = BABYLON.Vector3.Zero();
    this.isJumping = false;
    this.isGrounded = false;
  }

  public getMesh(): BABYLON.Mesh {
    return this.mesh;
  }

  public getPosition(): Vector3D {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
    };
  }

  public getVelocity(): Vector3D {
    return {
      x: this.velocity.x,
      y: this.velocity.y,
      z: this.velocity.z,
    };
  }

  public receiveDamage(direction: BABYLON.Vector3, force: number = 5): void {
    this.velocity.addInPlace(direction.scale(force));
  }

  public destroy(): void {
    this.mesh.dispose();
  }
}
