import {
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  OutputRefSubscription,
  Renderer2,
  ViewContainerRef,
  contentChild,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import { ExpandCollapseService } from '../services/expand-collapse.service';
import { ExpandCollapseButtonsComponent } from '../expand-collapse-buttons/expand-collapse-buttons.component';

@Directive({
  selector: '[static-content]'
})
export class StaticContentDirective {
  public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}

@Directive({
  selector: '[collapsable-content]'
})
export class CollapsableContentDirective {
  public readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}

interface StaticEntry {
  element: HTMLElement;
  mountPoint: HTMLElement;
  buttonsRef: ComponentRef<ExpandCollapseButtonsComponent>;
  toggleSub: OutputRefSubscription;
}

@Directive({
  selector: '[boExpandCollapse]',
  exportAs: 'boExpandCollapse'
})
export class ExpandCollapseDirective {
  private readonly collapsableAnimatedClass = 'bo-collapsable-content';
  private readonly collapsableCollapsedClass = 'bo-collapsable-content--collapsed';

  public readonly isExpandable = input<boolean>(true);
  public readonly storageName = input<string>('');
  public readonly initialExpanded = input<boolean | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly expandCollapseService = inject(ExpandCollapseService);
  private readonly staticContent = contentChild(StaticContentDirective, { descendants: true });
  private readonly collapsableContent = contentChild(CollapsableContentDirective, { descendants: true });
  private staticEntry: StaticEntry | null = null;
  private readonly isExpanded = signal(true);
  public readonly expanded = this.isExpanded.asReadonly();
  private initialExpandedApplied = false;

  constructor() {
    effect(onCleanup => {
      if (!this.isExpandable()) {
        return;
      }

      const sub = this.expandCollapseService.observeIsExpanded(this.storageName()).subscribe(value => this.isExpanded.set(value));

      if (!this.initialExpandedApplied) {
        const initialExpanded = untracked(() => this.initialExpanded());
        if (initialExpanded !== null) {
          this.isExpanded.set(initialExpanded);
        }
        this.initialExpandedApplied = true;
      }

      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      if (!this.isExpandable()) {
        this.cleanupStaticEntry();
        this.showCollapsableContent();

        return;
      }

      this.staticContent();
      this.collapsableContent();
      this.isExpanded();
      this.syncStaticNode();
      this.applyExpandedState();
    });

    this.destroyRef.onDestroy(() => {
      this.cleanupStaticEntry();
    });
  }

  private syncStaticNode(): void {
    const currentElement = this.staticContent()?.elementRef.nativeElement ?? null;

    if (this.staticEntry?.element === currentElement) {
      return;
    }

    this.cleanupStaticEntry();

    if (currentElement) {
      this.staticEntry = this.createStaticEntry(currentElement);
    }
  }

  private cleanupStaticEntry(): void {
    if (!this.staticEntry) {
      return;
    }

    this.destroyStaticEntry(this.staticEntry);
    this.staticEntry = null;
  }

  private createStaticEntry(element: HTMLElement): StaticEntry {
    const buttonsRef = this.viewContainerRef.createComponent(ExpandCollapseButtonsComponent, {
      injector: this.injector
    });
    buttonsRef.setInput('expanded', this.isExpanded());
    const mountPoint = element.firstElementChild instanceof HTMLElement ? element.firstElementChild : element;
    this.renderer.insertBefore(mountPoint, buttonsRef.location.nativeElement, mountPoint.firstChild);

    const toggleSub = buttonsRef.instance.toggled.subscribe(() => {
      this.isExpanded.set(!this.isExpanded());
    });

    return {
      element,
      mountPoint,
      buttonsRef,
      toggleSub
    };
  }

  private destroyStaticEntry(entry: StaticEntry): void {
    entry.toggleSub.unsubscribe();
    if (entry.buttonsRef.location.nativeElement.parentNode === entry.mountPoint) {
      entry.mountPoint.removeChild(entry.buttonsRef.location.nativeElement);
    }
    entry.buttonsRef.destroy();
  }

  private showCollapsableContent(): void {
    const collapsableNode = this.collapsableContent();
    if (!collapsableNode) {
      return;
    }

    const element = collapsableNode.elementRef.nativeElement;
    this.renderer.removeClass(element, this.collapsableAnimatedClass);
    this.renderer.removeClass(element, this.collapsableCollapsedClass);
  }

  private applyExpandedState(): void {
    const collapsableNode = this.collapsableContent();
    if (collapsableNode) {
      const element = collapsableNode.elementRef.nativeElement;
      this.renderer.addClass(element, this.collapsableAnimatedClass);
      if (this.isExpanded()) {
        this.renderer.removeClass(element, this.collapsableCollapsedClass);
      } else {
        this.renderer.addClass(element, this.collapsableCollapsedClass);
      }
    }

    if (this.staticEntry) {
      this.staticEntry.buttonsRef.setInput('expanded', this.isExpanded());
    }
  }
}
