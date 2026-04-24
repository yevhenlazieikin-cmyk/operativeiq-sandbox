import { ChangeDetectionStrategy, Component, input, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgTemplateOutlet } from '@angular/common';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';

export type Files = File | File[];
/** Allowed types for comment attachments: image/*, video/*, documents, archives (plan: 15 MB max) */
export const ACCEPTED_FILE_TYPES = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,text/plain,.zip,.7z,.rar,.tar,.tar.gz';

@Component({
  selector: 'app-file-uploader',
  imports: [MatIconButton, MatTooltip, NgTemplateOutlet, SvgIconComponent],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploaderComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploaderComponent implements ControlValueAccessor {
  public value!: Files | null;

  public readonly multiple = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly accept = input<string>(ACCEPTED_FILE_TYPES);
  public readonly customTemplate = input<TemplateRef<any>>();

  public onChange = (v: Files | null): void => {};

  public onTouched = (): void => {};

  public registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public writeValue(value: Files | null): void {
    this.value = value;
    this.onChange(value);
  }

  public onFileSelected(event: Event): void {
    const files = this._getFiles(event.target as HTMLInputElement);

    if (!files) {
      return;
    }

    this.writeValue(files);
    const inputElem = event.target as HTMLInputElement;
    inputElem.value = '';
  }

  private _getFiles(element: HTMLInputElement): Files | null {
    const { files } = element;
    if (element.getAttribute('multiple')) {
      return files ? Array.from(files) : null;
    }

    return files?.length ? files[0] : null;
  }
}
