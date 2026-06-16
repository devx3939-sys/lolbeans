import { InputState } from '../types/index';

/**
 * Handles keyboard and gamepad input
 */
export class InputHandler {
  private static keys: Map<string, boolean> = new Map();
  private static inputState: InputState = {
    moveX: 0,
    moveY: 0,
    jump: false,
    dive: false,
    isMobile: false,
  };

  public static init(): void {
    document.addEventListener('keydown', (e) => InputHandler.onKeyDown(e));
    document.addEventListener('keyup', (e) => InputHandler.onKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => InputHandler.onGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => InputHandler.onGamepadDisconnected(e));
  }

  public static update(): InputState {
    // Reset directional input
    InputHandler.inputState.moveX = 0;
    InputHandler.inputState.moveY = 0;

    // Keyboard input
    if (InputHandler.keys.get('w') || InputHandler.keys.get('ArrowUp')) {
      InputHandler.inputState.moveY += 1;
    }
    if (InputHandler.keys.get('s') || InputHandler.keys.get('ArrowDown')) {
      InputHandler.inputState.moveY -= 1;
    }
    if (InputHandler.keys.get('a') || InputHandler.keys.get('ArrowLeft')) {
      InputHandler.inputState.moveX -= 1;
    }
    if (InputHandler.keys.get('d') || InputHandler.keys.get('ArrowRight')) {
      InputHandler.inputState.moveX += 1;
    }

    // Jump and dive buttons
    InputHandler.inputState.jump = InputHandler.keys.get(' ') ?? false;
    InputHandler.inputState.dive = InputHandler.keys.get('shift') ?? false;

    // Gamepad input
    InputHandler.updateGamepadInput();

    // Normalize diagonal movement
    const magnitude = Math.sqrt(
      InputHandler.inputState.moveX ** 2 + InputHandler.inputState.moveY ** 2
    );
    if (magnitude > 1) {
      InputHandler.inputState.moveX /= magnitude;
      InputHandler.inputState.moveY /= magnitude;
    }

    return InputHandler.inputState;
  }

  public static getInputState(): InputState {
    return InputHandler.inputState;
  }

  private static onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    InputHandler.keys.set(key, true);
  }

  private static onKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    InputHandler.keys.set(key, false);
  }

  private static updateGamepadInput(): void {
    const gamepads = navigator.getGamepads();
    if (!gamepads || gamepads.length === 0) return;

    const gamepad = gamepads[0];
    if (!gamepad) return;

    // Analog stick (axes 0 and 1)
    if (gamepad.axes) {
      InputHandler.inputState.moveX = gamepad.axes[0];
      InputHandler.inputState.moveY = -gamepad.axes[1]; // Invert Y for common convention

      // Apply deadzone
      const deadzone = 0.15;
      if (Math.abs(InputHandler.inputState.moveX) < deadzone) {
        InputHandler.inputState.moveX = 0;
      }
      if (Math.abs(InputHandler.inputState.moveY) < deadzone) {
        InputHandler.inputState.moveY = 0;
      }
    }

    // Buttons
    if (gamepad.buttons) {
      InputHandler.inputState.jump = gamepad.buttons[0]?.pressed ?? false; // A button
      InputHandler.inputState.dive = gamepad.buttons[1]?.pressed ?? false; // B button
    }
  }

  private static onGamepadConnected(event: GamepadEvent): void {
    console.log('Gamepad connected:', event.gamepad);
  }

  private static onGamepadDisconnected(event: GamepadEvent): void {
    console.log('Gamepad disconnected:', event.gamepad);
  }

  public static destroy(): void {
    document.removeEventListener('keydown', (e) => InputHandler.onKeyDown(e));
    document.removeEventListener('keyup', (e) => InputHandler.onKeyUp(e));
  }
}
