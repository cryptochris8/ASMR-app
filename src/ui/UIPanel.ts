export abstract class UIPanel {
  protected element: HTMLDivElement;
  protected mounted = false;

  constructor(protected container: HTMLElement, protected className: string) {
    this.element = document.createElement('div');
    this.element.className = className;
    this.element.style.display = 'none';
    this.container.appendChild(this.element);
  }

  show(): void {
    this.beforeShow?.();
    this.render();
    this.element.style.display = '';
    requestAnimationFrame(() => { this.element.style.opacity = '1'; });
    this.afterShow?.();
  }

  hide(): void {
    this.beforeHide?.();
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.style.display = 'none';
      this.afterHide?.();
    }, 300);
  }

  protected abstract render(): void;
  protected beforeShow?(): void;
  protected afterShow?(): void;
  protected beforeHide?(): void;
  protected afterHide?(): void;
}
