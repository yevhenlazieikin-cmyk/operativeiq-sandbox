import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {
  ActionButton,
  ActionButtonSubPanel,
  CustomHeaderButton,
  DetailsPanel,
  FieldConfig,
  FieldType,
  markAsTouchedAndValidate,
  menuType
} from '@backoffice/shared-ui';
import { DialogMessagesComponent } from '@backoffice/shared-ui/lib/dialog-notifications/dialog-messages.component';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SecurityVerificationDialogData,
  SecurityVerificationDialogResult
} from '../security-verification-dialog/security-verification-dialog.interface';
import { DialogInputNavigationDirective } from '../directives/dialog-input-navigation.directive';

@Component({
  selector: 'bo-digital-signature-pin-security-verification-dialog',
  imports: [
    DialogMessagesComponent,
    MatDialogContent,
    SvgIconComponent,
    CommonModule,
    DetailsPanel,
    ActionButtonSubPanel,
    DialogInputNavigationDirective
  ],
  templateUrl: './digital-signature-pin-security-verification-dialog.html',
  styleUrl: './digital-signature-pin-security-verification-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DigitalSignaturePinSecurityVerificationDialog implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signatureCanvas', { static: false }) signatureCanvasRef!: ElementRef<HTMLCanvasElement>;

  public data = inject<SecurityVerificationDialogData>(MAT_DIALOG_DATA);
  public readonly userMenu = signal<menuType>(this.data?.userMenu ?? menuType.administration);
  public readonly menuType = menuType;
  public validationMessage: string | null = null;
  public validationMessageClass = 'error-message';
  public maxMessageLength = 65;
  public readonly dialogRef = inject(MatDialogRef<DigitalSignaturePinSecurityVerificationDialog>);

  constructor() {
    this.dialogRef.disableClose = true;
  }

  public canvasActionButtons: ActionButton[] = [
    {
      name: 'Clear',
      actionCB: () => {
        this.clearSignature();
      }
    }
  ];

  public readonly userName = signal<string>(this.data?.userName ?? 'User');
  public readonly loginId = signal<string>(this.data?.loginId ?? '');

  public userVerificationDetailsPanel: FieldConfig[] = [
    {
      label: 'Login ID:',
      required: false,
      type: FieldType.ReadOnly,
      formControlName: 'loginId'
    },
    {
      label: 'Pin:',
      required: true,
      type: FieldType.Password,
      formControlName: 'pin',
      customRequiredValidationMessage: 'Pin is required.'
    }
  ];

  public actionButtons: CustomHeaderButton[] = [
    {
      label: 'Continue',
      state: false,
      action: () => {
        markAsTouchedAndValidate(this.form);
        if (!this.form.valid || !this.hasSignature()) {
          if (!this.form.valid) {
            this.validationMessage = 'Pin is required.';
          } else {
            this.validationMessage = 'Please sign confirmation.';
          }
          this.validationMessageClass = 'error-message';
          this._cdr.markForCheck();

          return;
        }
        this.validationMessage = null;
        const result: SecurityVerificationDialogResult = {
          verified: true,
          pin: this.form.value.pin,
          signature: this.getSignatureDataUrl()
        };
        if (this.data?.onVerified) {
          this.data.onVerified(this.dialogRef as MatDialogRef<unknown>, result);
        } else {
          this.dialogRef.close(result);
        }
      }
    }
  ];

  public form!: FormGroup;

  private readonly formBuilder = inject(FormBuilder);
  private readonly _cdr = inject(ChangeDetectorRef);
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  public ngOnInit(): void {
    this.createForm();
  }

  public ngAfterViewInit(): void {
    this.initSignatureCanvas();
  }

  @HostListener('keydown.escape')
  public onEscapeKey(): void {
    this.onCancel();
  }

  public ngOnDestroy(): void {
    this.removeCanvasListeners();
  }

  public onCancel(): void {
    this.dialogRef.close({ verified: false });
  }

  /** Host (e.g. profile enroll) can call after async verify fails — OnPush otherwise skips updating the banner. */
  public showValidationError(message: string, messageClass = 'error-message'): void {
    this.validationMessage = message;
    this.validationMessageClass = messageClass;
    this._cdr.markForCheck();
  }

  public clearSignature(): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  public hasSignature(): boolean {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || !this.ctx) return false;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r !== 255 || g !== 255 || b !== 255) return true; // any non-white pixel (drawn stroke)
    }

    return false;
  }

  public getSignatureDataUrl(): string | null {
    const canvas = this.signatureCanvasRef?.nativeElement;

    return canvas ? canvas.toDataURL('image/png') : null;
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      loginId: [{ value: this.loginId(), disabled: true }],
      pin: ['', [Validators.required]]
    });
  }

  private initSignatureCanvas(): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width);
    canvas.height = Math.round(rect.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';

    this.attachCanvasListeners(canvas);
  }

  /** Returns drawing coordinates: map pointer to canvas using current getBoundingClientRect() so line follows cursor 1:1. */
  private getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private startDrawing(clientX: number, clientY: number): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    const { x, y } = this.getCanvasPoint(canvas, clientX, clientY);
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
  }

  private draw(clientX: number, clientY: number): void {
    if (!this.isDrawing || !this.ctx) return;
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return;
    const { x, y } = this.getCanvasPoint(canvas, clientX, clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  private stopDrawing(): void {
    this.isDrawing = false;
  }

  private readonly boundStart = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    this.startDrawing(clientX, clientY);
  };

  private readonly boundDraw = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
    this.draw(clientX, clientY);
  };

  private readonly boundStop = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    this.stopDrawing();
  };

  private attachCanvasListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', this.boundStart);
    canvas.addEventListener('mousemove', this.boundDraw);
    canvas.addEventListener('mouseup', this.boundStop);
    canvas.addEventListener('mouseleave', this.boundStop);
    canvas.addEventListener('touchstart', this.boundStart, { passive: false });
    canvas.addEventListener('touchmove', this.boundDraw, { passive: false });
    canvas.addEventListener('touchend', this.boundStop, { passive: false });
  }

  private removeCanvasListeners(): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) return;
    canvas.removeEventListener('mousedown', this.boundStart);
    canvas.removeEventListener('mousemove', this.boundDraw);
    canvas.removeEventListener('mouseup', this.boundStop);
    canvas.removeEventListener('mouseleave', this.boundStop);
    canvas.removeEventListener('touchstart', this.boundStart);
    canvas.removeEventListener('touchmove', this.boundDraw);
    canvas.removeEventListener('touchend', this.boundStop);
  }
}
