import { Direction } from '@angular/cdk/bidi';
import { Point } from '@angular/cdk/drag-drop';
import { ConnectionPositionPair, FlexibleConnectedPositionStrategy, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType, TemplatePortal } from '@angular/cdk/portal';
import { ComponentRef, EmbeddedViewRef, inject, Injectable, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreateTemplateWithOverlayService {
  public overlayRef!: OverlayRef;
  private _renderer!: Renderer2;

  private readonly _overlay = inject(Overlay);

  public openOverlayWithTemplate(
    tpl: TemplateRef<any> | ComponentType<any>,
    origin: HTMLElement | Point,
    viewContainerRef: ViewContainerRef,
    renderer: Renderer2,
    direction: Direction = 'rtl',
    offsetY = -4,
    isTemp = true,
    flexiblePos = false
  ): EmbeddedViewRef<any> | ComponentRef<any> {
    this._renderer = renderer;
    this.overlayRef = this._overlay.create({
      maxWidth: 250,
      hasBackdrop: true,
      panelClass: 'user-details-overlay',
      backdropClass: 'user-details-backdrop',
      direction,
      scrollStrategy: !flexiblePos ? this._overlay.scrollStrategies.close() : this._overlay.scrollStrategies.reposition(),
      positionStrategy: this._getTemplatePosition(origin, offsetY, flexiblePos)
    });

    this.overlayRef.backdropClick().subscribe(() => {
      this.closeOverlayWithTemplate();
    });

    let templRef: EmbeddedViewRef<any> = {} as any;
    let componentRef: ComponentRef<any> = {} as any;
    if (isTemp) {
      templRef = this.overlayRef.attach(new TemplatePortal(tpl as TemplateRef<any>, viewContainerRef));
    } else {
      componentRef = this.overlayRef.attach(new ComponentPortal(tpl as ComponentType<any>, viewContainerRef));
    }

    this._setContainerStyle(1002);

    return templRef ? templRef : componentRef;
  }

  public closeOverlayWithTemplate(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this._setContainerStyle(1000);
    }
  }

  private _getTemplatePosition(origin: HTMLElement | Point, offsetY: number, flexiblePos = false): FlexibleConnectedPositionStrategy {
    const positions = !flexiblePos
      ? [
          new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }),
          new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' })
        ]
      : [
          new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }),
          new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
          new ConnectionPositionPair({ originX: 'end', originY: 'top' }, { overlayX: 'end', overlayY: 'bottom' }),
          new ConnectionPositionPair({ originX: 'end', originY: 'bottom' }, { overlayX: 'end', overlayY: 'top' })
        ];

    return this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withDefaultOffsetY(offsetY);
  }

  private _setContainerStyle(value: number): void {
    const overlay = document.querySelector('.cdk-overlay-container');
    if (overlay) {
      this._renderer.setStyle(overlay, 'z-index', value);
    }
  }
}
