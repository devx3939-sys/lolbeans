import * as BABYLON from '@babylonjs/core';

/**
 * Initializes and configures Babylon.js engine and scene
 */
export class BabylonSetup {
  public static createEngine(canvas: HTMLCanvasElement): BABYLON.Engine {
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return engine;
  }

  public static createScene(engine: BABYLON.Engine): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -9.8, 0);

    // Setup camera (isometric view)
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / 4,
      Math.PI / 3,
      50,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);
    camera.inertia = 0.7;
    camera.angularSensibilityX = 1000;
    camera.angularSensibilityY = 1000;

    // Setup lighting
    const light1 = new BABYLON.HemisphericLight(
      'hemiLight',
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light1.intensity = 0.7;

    const light2 = new BABYLON.PointLight(
      'pointLight',
      new BABYLON.Vector3(0, 10, 0),
      scene
    );
    light2.intensity = 0.8;

    // Setup ground (will be replaced by level geometry)
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { width: 100, height: 100 },
      scene
    );
    ground.position.y = -1;

    const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    groundMaterial.diffuse = new BABYLON.Color3(0.2, 0.8, 0.4);
    ground.material = groundMaterial;

    return scene;
  }

  public static createPlayerMesh(
    name: string,
    position: BABYLON.Vector3,
    color: string,
    scene: BABYLON.Scene
  ): BABYLON.Mesh {
    // Create bean-like player mesh (sphere)
    const player = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 1.5 }, scene);
    player.position = position;

    // Material
    const material = new BABYLON.StandardMaterial(`${name}Mat`, scene);
    material.diffuse = BABYLON.Color3.FromHexString(color);
    material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    player.material = material;

    // Physics (if using physics)
    player.checkCollisions = true;

    return player;
  }

  public static startRenderLoop(
    engine: BABYLON.Engine,
    scene: BABYLON.Scene,
    onUpdate: (deltaTime: number) => void
  ): () => void {
    let lastTime = Date.now();

    const renderLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      onUpdate(deltaTime);
      scene.render();
    };

    engine.runRenderLoop(renderLoop);

    // Return cleanup function
    return () => {
      engine.stopRenderLoop();
    };
  }
}
