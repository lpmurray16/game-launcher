import { inject, Injectable, NgZone, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type GamepadAction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'confirm'
  | 'back'
  | 'menu'
  | 'select';

@Injectable({ providedIn: 'root' })
export class GamepadService implements OnDestroy {
  readonly connected = signal(false);

  private readonly _actions = new Subject<GamepadAction>();
  readonly actions$ = this._actions.asObservable();

  private rafId: number | null = null;
  private prevButtons: boolean[] = [];
  private axisHeld = false;
  private axisHeldTimer = 0;

  private readonly AXIS_THRESHOLD = 0.5;
  private readonly REPEAT_DELAY_MS = 180;
  private readonly zone = inject(NgZone);

  constructor() {
    window.addEventListener('gamepadconnected', this.onConnect);
    window.addEventListener('gamepaddisconnected', this.onDisconnect);
  }

  ngOnDestroy(): void {
    window.removeEventListener('gamepadconnected', this.onConnect);
    window.removeEventListener('gamepaddisconnected', this.onDisconnect);
    this.stopLoop();
    this._actions.complete();
  }

  private onConnect = () => {
    this.zone.run(() => this.connected.set(true));
    this.startLoop();
  };

  private onDisconnect = () => {
    const pads = navigator.getGamepads().filter(Boolean);
    if (pads.length === 0) {
      this.zone.run(() => this.connected.set(false));
      this.stopLoop();
    }
  };

  private startLoop(): void {
    if (this.rafId !== null) return;
    this.zone.runOutsideAngular(() => this.tick());
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    this.rafId = requestAnimationFrame(this.tick);
    this.processTick();
  };

  private processTick(): void {
    const pads = navigator.getGamepads();
    const gp = pads.find((p) => p !== null) ?? null;
    if (!gp) return;

    const buttons = gp.buttons.map((b) => b.pressed);
    const prev = this.prevButtons;
    const justPressed = (idx: number): boolean => buttons[idx] && !prev[idx];

    if (justPressed(12)) this.emit('up');
    if (justPressed(13)) this.emit('down');
    if (justPressed(14)) this.emit('left');
    if (justPressed(15)) this.emit('right');
    if (justPressed(0)) this.emit('confirm');
    if (justPressed(1)) this.emit('back');
    if (justPressed(8)) this.emit('select');
    if (justPressed(9)) this.emit('menu');

    const ax = gp.axes[0] ?? 0;
    const ay = gp.axes[1] ?? 0;
    const now = performance.now();

    if (
      Math.abs(ax) > this.AXIS_THRESHOLD ||
      Math.abs(ay) > this.AXIS_THRESHOLD
    ) {
      if (!this.axisHeld || now - this.axisHeldTimer > this.REPEAT_DELAY_MS) {
        if (ay < -this.AXIS_THRESHOLD) this.emit('up');
        else if (ay > this.AXIS_THRESHOLD) this.emit('down');
        if (ax < -this.AXIS_THRESHOLD) this.emit('left');
        else if (ax > this.AXIS_THRESHOLD) this.emit('right');
        this.axisHeld = true;
        this.axisHeldTimer = now;
      }
    } else {
      this.axisHeld = false;
    }

    this.prevButtons = buttons;
  }

  private emit(action: GamepadAction): void {
    this.zone.run(() => this._actions.next(action));
  }
}
