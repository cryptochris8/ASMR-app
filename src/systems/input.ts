import { CONFIG } from '../game/config';

export interface InputCallbacks {
  onTap: (x: number, y: number) => void;
  onDragStart: (x: number, y: number) => void;
  onDragMove: (x: number, y: number, dx: number, dy: number) => void;
  onDragEnd: () => void;
  onHoldStart: (x: number, y: number) => void;
  onHoldEnd: () => void;
}

export class InputSystem {
  private container: HTMLElement;
  private callbacks: InputCallbacks;
  private pointerDown: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private lastX: number = 0;
  private lastY: number = 0;
  private holdTimer: number | null = null;
  private isHolding: boolean = false;
  private isDragging: boolean = false;
  private totalMoved: number = 0;

  constructor(container: HTMLElement, callbacks: InputCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.bindEvents();
  }

  private bindEvents(): void {
    const el = this.container;

    el.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    el.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    el.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    el.addEventListener('pointercancel', () => this.onPointerCancel(), { passive: false });

    // Prevent context menu on long press
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    this.pointerDown = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.totalMoved = 0;
    this.isDragging = false;
    this.isHolding = false;

    // Start hold detection timer
    this.holdTimer = window.setTimeout(() => {
      if (this.pointerDown && !this.isDragging) {
        this.isHolding = true;
        this.callbacks.onHoldStart(this.startX, this.startY);
      }
    }, CONFIG.holdThresholdMs);
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.pointerDown) return;
    e.preventDefault();

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.totalMoved += Math.abs(dx) + Math.abs(dy);

    // If moved enough, it's a drag
    if (!this.isDragging && this.totalMoved > CONFIG.dragMinDistance) {
      this.isDragging = true;

      // Cancel hold timer if dragging
      if (this.holdTimer !== null) {
        clearTimeout(this.holdTimer);
        this.holdTimer = null;
      }

      // End hold if was holding
      if (this.isHolding) {
        this.isHolding = false;
        this.callbacks.onHoldEnd();
      }

      this.callbacks.onDragStart(e.clientX, e.clientY);
    }

    if (this.isDragging) {
      this.callbacks.onDragMove(e.clientX, e.clientY, dx, dy);
    }

    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.pointerDown) return;
    e.preventDefault();
    this.pointerDown = false;

    // Clear hold timer
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.isHolding) {
      this.isHolding = false;
      this.callbacks.onHoldEnd();
    } else if (this.isDragging) {
      this.isDragging = false;
      this.callbacks.onDragEnd();
    } else {
      // It was a tap
      this.callbacks.onTap(e.clientX, e.clientY);
    }
  }

  private onPointerCancel(): void {
    this.pointerDown = false;

    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.isHolding) {
      this.isHolding = false;
      this.callbacks.onHoldEnd();
    }
    if (this.isDragging) {
      this.isDragging = false;
      this.callbacks.onDragEnd();
    }
  }

  getInteractionState(): { isDragging: boolean; isHolding: boolean } {
    return { isDragging: this.isDragging, isHolding: this.isHolding };
  }
}
