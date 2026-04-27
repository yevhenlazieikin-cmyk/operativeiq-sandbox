import { AfterViewInit, ContentChild, Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appMobViewType]',
  standalone: false
})
export class MobViewTypeDirective implements AfterViewInit {
  public appMobViewType = input<any>();
  public row = input<any>();
  public index = input<number>();
  public subIndex = input<number>();

  private _view!: any;

  @ContentChild('content', { read: TemplateRef }) template!: TemplateRef<any>;

  public set view(value: any) {
    this._view = value;
  }
  public get view(): any {
    return this._view;
  }

  public ngAfterViewInit(): void {
    this._updateView();
  }

  private _updateView(): void {
    this.view = {
      ...this.appMobViewType(),
      content: this.row()[this.appMobViewType().key],
      template: this.template,
      customTemplate: this.appMobViewType().content
    };
  }
}
