import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  Input,
  input,
  output,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { SvgIconComponent } from '@backoffice/shared-ui/lib/svg-icon/svg-icon.component';

type Format = '12' | '24';
type Segment = 'hour' | 'minute' | 'ampm';

@Component({
  selector: 'bo-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SvgIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePicker),
      multi: true
    }
  ],
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.scss'
})
export class TimePicker implements ControlValueAccessor {
  @ViewChild('popover', { static: false }) public popoverRef!: ElementRef<HTMLElement> | null;
  @ViewChild('host', { static: true }) public hostRef!: ElementRef<HTMLElement>;
  @ViewChild('textInput', { static: false }) public textInputRef!: ElementRef<HTMLInputElement> | null;

  public formatValue = input<Format>('24');
  public allowFormatToggle = input<boolean>(false);
  public formControlName = input<string>();
  public disabled = input<boolean>(false);
  public readonly timeChange = output<string>();

  public isOpen = signal<boolean>(false);
  public isDisabled = false;

  // canonical internal state
  public hour = 0; // 0..23
  public minute = 0; // 0..59
  public isAm = true;
  public displayValue = '';
  public format: Format = '24';
  public control: AbstractControl | null = null;

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly controlContainer = inject(ControlContainer, { optional: true, host: true, skipSelf: true });

  // editing buffers to mimic native segment typing behavior
  private readonly typedBuffers = { hour: '', minute: '' };
  private lastEditedSegment: Segment | null = null;
  private hoursBuffer!: string | number;
  private minutesBuffer!: string | number;
  @Input()
  public set timeValue(val: string) {
    if (val === null || val === '') {
      this.displayValue = '';
      this._timeValue.set('');

      return;
    }
    const { hour, minute } = this.hydrateFromText(val) ?? { hour: 0, minute: 0 };
    this.hour = hour;
    this.minute = minute;
    if (this.format === '12' && !(val.toLowerCase().includes('am') || val.toLowerCase().includes('pm'))) {
      this.updateDisplayHours();
      this.updateDisplayMinutes();
    }
    this.syncDisplayFromParts();
    this._timeValue.set(this.displayValue);
    this.cdr.detectChanges();
  }
  public get timeValue(): string {
    return this._timeValue();
  }

  @HostBinding('timeValue')
  get hostTimeValue() {
    this.timeChange.emit(this._timeValue());

    return this._timeValue();
  }

  private readonly _timeValue = signal('');

  // ControlValueAccessor callbacks
  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      if (!this.formControlName()) {
        this.isDisabled = this.disabled();
      }
      const oldFormat = this.format;
      this.format = this.formatValue();
      if (oldFormat !== this.format && (this.timeValue || this.control?.value)) {
        this.syncDisplayFromParts();
      }
    });

    if (this.formControlName()) {
      this.control = this.controlContainer?.control?.get(this.formControlName()!) || null;
    }
  }

  /* Utilities*/
  private pad2(n: number) {
    return String(n).padStart(2, '0');
  }
  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }
  private normalizeDigits(s: string, maxLen = 2) {
    return s.replace(/\D/g, '').slice(0, maxLen);
  }

  private formatToDisplay(h24: number, m: number): string {
    if (this.format === '12') {
      const isPm = h24 >= 12;
      this.isAm = !isPm;
      let hh = h24 % 12;
      if (hh === 0) hh = 12;

      return `${this.pad2(hh)}:${this.pad2(m)} ${isPm ? 'PM' : 'AM'}`;
    }

    return `${this.pad2(h24)}:${this.pad2(m)}`;
  }

  private setInputValue(val: string, preserveCaret = true, desiredSegment: Segment | null = null) {
    const el = this.textInputRef?.nativeElement;
    if (!el) return;
    // preserve caret/selection
    const selStart = el.selectionStart ?? null;
    const selEnd = el.selectionEnd ?? null;

    el.value = val;

    // restore caret in a safe way
    if (preserveCaret && selStart != null && selEnd != null) {
      // if we supply desiredSegment, select that segment
      if (desiredSegment) {
        this.selectSegment(desiredSegment);

        return;
      }
      try {
        el.setSelectionRange(selStart, selEnd);
      } catch (e) {}
    } else if (desiredSegment) {
      this.selectSegment(desiredSegment);
    }
  }

  private notifyChange() {
    const out = this.formatToDisplay(this.hour, this.minute);
    this.onChange(out);
    this.timeChange.emit(out);
  }

  private getSegmentAtCaret(caret: number | null, value: string): Segment {
    if (caret == null) return 'hour';
    if (caret <= 2) return 'hour';
    if (caret <= 5) return 'minute';

    return 'ampm';
  }

  private selectSegment(seg: Segment) {
    const el = this.textInputRef?.nativeElement;
    if (!el) return;
    if (seg === 'hour') el.setSelectionRange(0, 2);
    else if (seg === 'minute') el.setSelectionRange(3, 5);
    else {
      const start = Math.max(0, el.value.length - 2);
      el.setSelectionRange(start, el.value.length);
    }
    this.lastEditedSegment = seg;
  }

  /* Input / Keyboard */
  public onInput(event: Event) {
    // keep minimal and safe: try to parse full-time pasted/typed strings,
    // otherwise re-sync from internal canonical state and restore caret
    const el = event.target as HTMLInputElement;
    let raw = el.value || '';
    raw = raw.replace(/\u00A0/g, ' ').trim();

    const parsed = this.hydrateFromText(raw);
    if (parsed) {
      // user pasted or typed full time (or we parsed a valid combination)
      this.hour = parsed.hour;
      this.minute = parsed.minute;
      this.displayValue = this.formatToDisplay(this.hour, this.minute);
      this.setInputValue(this.displayValue, false); // reset caret to default
      this.notifyChange();

      return;
    }

    // otherwise reject invalid fragments and restore from canonical state
    this.syncDisplayFromParts();
  }

  // eslint-disable-next-line complexity
  public onKeydown(e: KeyboardEvent): void {
    if (this.isDisabled) return;
    const el = e.currentTarget as HTMLInputElement;
    const caret = el.selectionStart ?? 0;
    const seg = this.getSegmentAtCaret(caret, el.value);

    // direct control keys
    if (e.key === 'Enter') {
      e.preventDefault();
      this.applyAndClose();

      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close(false);

      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (seg === 'minute') this.selectSegment('hour');
      else if (seg === 'ampm') this.selectSegment('minute');
      else this.selectSegment('hour');

      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (seg === 'hour') this.selectSegment('minute');
      else if (seg === 'minute' && (this.format === '12' || this.allowFormatToggle())) this.selectSegment('ampm');
      else this.selectSegment('minute');

      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (seg === 'hour') {
        if (e.key === 'ArrowUp') this.incHour();
        else this.decHour();
      } else if (seg === 'minute') {
        if (e.key === 'ArrowUp') this.incMinute();
        else this.decMinute();
      } else this.toggleAmPm();
      this.selectSegment(seg);

      return;
    }

    // Backspace/Delete: clear current segment buffer and set segment to zero-ish
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (seg === 'hour') {
        this.typedBuffers.hour = '';
        this.hour = 0;
      } else if (seg === 'minute') {
        this.typedBuffers.minute = '';
        this.minute = 0;
      } else {
        /* ampm area: toggle to AM (or do nothing) */
      }
      this.syncDisplayFromParts();
      this.selectSegment(seg);

      return;
    }

    // allow 'a' / 'p' to set AM/PM in 12h formats
    if (/^[apAP]$/.test(e.key)) {
      e.preventDefault();
      if (this.format === '12') {
        const wantPm = e.key.toLowerCase() === 'p';
        if (wantPm && this.hour < 12) this.hour = (this.hour % 12) + 12;
        if (!wantPm && this.hour >= 12) this.hour = this.hour - 12;
        this.syncDisplayFromParts();
        this.selectSegment('ampm');
      }

      return;
    }

    // numeric digit handling: typed buffer per segment, auto-advance
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const digit = e.key;
      if (seg === 'hour') {
        this.typedBuffers.hour += digit;
        this.typedBuffers.hour = this.normalizeDigits(this.typedBuffers.hour, 2);

        let candidate = parseInt(this.typedBuffers.hour || '0', 10) || 0;

        if (this.format === '12') {
          // in 12h: accept 1..12
          // when typed buffer becomes logically complete -> advance
          const complete = this.typedBuffers.hour.length === 2 || candidate >= 3;
          // clamp 1..12
          if (candidate === 0) candidate = 1;
          candidate = this.clamp(candidate, 1, 12);
          // preserve AM/PM from current hour
          const isAm = (this.isAm = this.hour < 12);
          this.hour = this.from12Hour(candidate, isAm);
          if (complete) {
            this.typedBuffers.hour = '';
            this.selectSegment('minute');
            this.lastEditedSegment = 'minute';
          } else {
            this.selectSegment('hour');
            this.lastEditedSegment = 'hour';
          }
        } else {
          // 24h
          const complete = this.typedBuffers.hour.length === 2 || candidate >= 3;
          candidate = this.clamp(candidate, 0, 23);
          this.hour = candidate;
          if (complete) {
            this.typedBuffers.hour = '';
            this.selectSegment('minute');
            this.lastEditedSegment = 'minute';
          } else {
            this.selectSegment('hour');
            this.lastEditedSegment = 'hour';
          }
        }
        this.syncDisplayFromParts();

        return;
      }

      if (seg === 'minute') {
        this.typedBuffers.minute += digit;
        this.typedBuffers.minute = this.normalizeDigits(this.typedBuffers.minute, 2);
        let candidate = parseInt(this.typedBuffers.minute || '0', 10) || 0;
        candidate = this.clamp(candidate, 0, 59);
        this.minute = candidate;
        const complete = this.typedBuffers.minute.length === 2;
        if (complete) {
          this.typedBuffers.minute = '';
          if (this.format === '12' || this.allowFormatToggle()) {
            this.selectSegment('ampm');
            this.lastEditedSegment = 'ampm';
          } else {
            this.selectSegment('minute');
            this.lastEditedSegment = 'minute';
          }
        } else {
          this.selectSegment('minute');
          this.lastEditedSegment = 'minute';
        }
        this.syncDisplayFromParts();

        return;
      }

      // if in AM/PM region, typing digits is ignored
    }

    // otherwise (Tab, Ctrl, etc.) allow default handling
  }

  public handleCursor(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    // wait for native click selection to settle then pick segment
    setTimeout(() => {
      const pos = inputElement.selectionStart ?? 0;
      const seg = this.getSegmentAtCaret(pos, inputElement.value);
      this.selectSegment(seg);
    }, 0);
  }

  public onBlur() {
    // commit normalized value when user leaves input
    this.commitValue();
    this.typedBuffers.hour = '';
    this.typedBuffers.minute = '';
    this.lastEditedSegment = null;
  }

  /* Popover & Positioning (kept from original) */
  public togglePopover(event: Event) {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close(false);
    } else this.openPopover();
  }

  public openPopover() {
    if (this.isOpen() || this.isDisabled) {
      return;
    }

    this.isOpen.set(true);
    this.hydrateFromDisplay();
    this.updateDisplayHours();
    this.updateDisplayMinutes();
    setTimeout(() => this.positionPopover());
  }

  private positionPopover() {
    const hostRect = this.hostRef.nativeElement.getBoundingClientRect();
    const popEl = this.popoverRef?.nativeElement;
    if (!popEl) return;
    this.renderer.setStyle(popEl, 'position', 'fixed');
    const desiredMinWidth = Math.max(hostRect.width, 220);
    this.renderer.setStyle(popEl, 'minWidth', `${desiredMinWidth}px`);
    const popRect = popEl.getBoundingClientRect();
    const popHeight = popRect.height || 160;
    const popWidth = popRect.width || desiredMinWidth;
    const spaceBelow = window.innerHeight - hostRect.bottom;
    const spaceAbove = hostRect.top;
    let top = 0;
    if (spaceBelow >= popHeight || spaceBelow >= spaceAbove) top = hostRect.bottom + 8;
    else top = hostRect.top - popHeight - 8;
    let { left } = hostRect;
    if (left + popWidth > window.innerWidth - 8) left = Math.max(8, window.innerWidth - popWidth - 8);
    if (left < 8) left = 8;
    this.renderer.setStyle(popEl, 'top', `${top}px`);
    this.renderer.setStyle(popEl, 'left', `${left}px`);
  }

  public close(commit: boolean) {
    if (commit) this.commitValue();
    this.isOpen.set(false);
  }

  public applyAndClose() {
    this.commitValue();
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape', ['$event'])
  public handleEscape(_e: KeyboardEvent) {
    if (this.isOpen()) {
      this.close(false);
    }
  }

  /* Popover controls */
  get displayHour() {
    return this.hoursBuffer || this.hour;
  }

  set displayHours(value: string) {
    this.hoursBuffer = value;
  }

  get displayMinute() {
    return (this.minutesBuffer as string) || this.minute;
  }

  set displayMinute(value: string | number) {
    this.minutesBuffer = value;
  }

  public updateDisplayHours(): void {
    if (this.format === '12') {
      const h = this.hour % 24;
      const hh = h % 12 === 0 ? 12 : h % 12;

      this.displayHours = this.pad2(hh);

      return;
    }

    this.displayHours = this.pad2(this.hour);
  }

  public updateDisplayMinutes(): void {
    this.minutesBuffer = this.pad2(this.minute);
  }

  public incHour(fromPopup = false) {
    this.hoursBuffer = '';
    if (this.format === '12') {
      let v = this.to12Hour(this.hour);
      v = v === 12 ? 1 : v + 1;
      // preserve AM/PM
      const isAm = (this.isAm = this.hour < 12);
      this.hour = this.from12Hour(v, isAm);
    } else {
      this.hour = (this.hour + 1) % 24;
    }
    if (!fromPopup) {
      this.syncDisplayFromParts();
    } else {
      this.updateDisplayHours();
    }
  }

  public decHour(fromPopup = false) {
    this.hoursBuffer = '';
    if (this.format === '12') {
      let v = this.to12Hour(this.hour);
      v = v === 1 ? 12 : v - 1;
      const isAm = (this.isAm = this.hour < 12);
      this.hour = this.from12Hour(v, isAm);
    } else {
      this.hour = (this.hour + 23) % 24;
    }
    if (!fromPopup) {
      this.syncDisplayFromParts();
    } else {
      this.updateDisplayHours();
    }
  }

  public incMinute(fromPopup = false) {
    this.minute = (this.minute + 1) % 60;
    if (!fromPopup) {
      this.syncDisplayFromParts();
    } else {
      this.updateDisplayMinutes();
    }
  }
  public decMinute(fromPopup = false) {
    this.minute = (this.minute + 59) % 60;
    if (!fromPopup) {
      this.syncDisplayFromParts();
    } else {
      this.updateDisplayMinutes();
    }
  }

  public toggleAmPm(fromPopup = false) {
    this.isAm = !this.isAm;
    if (this.hour >= 12) this.hour -= 12;
    else this.hour += 12;
    if (!fromPopup) {
      this.syncDisplayFromParts();
    }
  }

  public onHourInput(e: Event) {
    const v = this.normalizeDigits((e.target as HTMLInputElement).value);
    if (!v) return;
    let num = parseInt(v, 10) || 0;
    if (this.format === '12') {
      if (num < 1) num = 1;
      if (num > 12) num = 12;
      const isAm = (this.isAm = this.hour < 12);
      this.hour = this.from12Hour(num, isAm);
    } else {
      if (num < 0) num = 0;
      if (num > 23) num = 23;
      this.hour = num;
    }
  }

  public onMinuteInput(e: Event) {
    const v = this.normalizeDigits((e.target as HTMLInputElement).value);
    if (!v) return;
    let num = parseInt(v, 10) || 0;
    num = this.clamp(num, 0, 59);
    this.minute = num;
  }

  public onFormatToggle(event: Event) {
    const { checked } = event.target as HTMLInputElement;
    const newFormat: Format = checked ? '12' : '24';
    if (this.format !== newFormat) {
      // preserve logical moment: only change display format
      this.format = newFormat;
      this.syncDisplayFromParts();
    }
    this.updateDisplayHours();
    this.updateDisplayMinutes();
  }

  public syncDisplayFromParts() {
    this.displayValue = this.formatToDisplay(this.hour, this.minute);
    this.setInputValue(this.displayValue, true, this.lastEditedSegment);
    this.onChange(this.displayValue);
  }

  /* Parsing / hydration */
  // parse strings like "05:45", "5:4 PM", "17:25", "5 45 pm" -> returns normalized hour/minute
  private hydrateFromText(raw: string): { hour: number; minute: number } | null {
    if (!raw || !raw.trim()) return null;
    const cleaned = raw
      .replace(/[.,;]/g, ':')
      .replace(/\u00A0/g, ' ')
      .trim();
    const ampmMatch = /(am|pm|a|p)$/i.exec(cleaned);
    const is12 = !!ampmMatch;
    let isPm = false;
    if (ampmMatch) isPm = /^p/i.test(ampmMatch[0]);
    this.isAm = !isPm;
    const withoutAm = cleaned.replace(/\s*(am|pm|a|p)$/i, '').trim();
    const parts = withoutAm
      .replace(/[^0-9:]/g, ':')
      .split(':')
      .filter(Boolean);
    if (parts.length === 0) return null;
    let hh = parseInt(parts[0].slice(0, 2), 10) || 0;
    let mm = parts.length >= 2 ? parseInt(parts[1].slice(0, 2), 10) || 0 : 0;
    mm = this.clamp(mm, 0, 59);
    if (is12) {
      hh = this.clamp(hh || 12, 1, 12);
      const h24 = this.from12Hour(hh, !isPm);

      return { hour: h24 % 24, minute: mm };
    } else {
      hh = this.clamp(hh, 0, 23);

      return { hour: hh, minute: mm };
    }
  }

  public hydrateFromDisplay() {
    const raw = this.displayValue || (this.textInputRef?.nativeElement?.value ?? '');
    const parsed = this.hydrateFromText(raw);
    if (!parsed) return;
    this.hour = parsed.hour % 24;
    this.minute = parsed.minute % 60;
    this.displayValue = this.formatToDisplay(this.hour, this.minute);
    if (this.textInputRef?.nativeElement) this.textInputRef.nativeElement.value = this.displayValue;
  }

  public commitValue() {
    this.displayValue = this.formatToDisplay(this.hour, this.minute);
    this.timeValue = this.displayValue;
    if (this.textInputRef?.nativeElement) this.textInputRef.nativeElement.value = this.displayValue;
    this.onChange(this.displayValue);
    this.onTouched();
    this.timeChange.emit(this.displayValue);
  }

  // 12h helpers
  public to12Hour(h24: number) {
    const h = h24 % 24;

    return h % 12 === 0 ? 12 : h % 12;
  }

  public from12Hour(h12: number, am: boolean) {
    let hh = h12 % 12;
    if (!am) hh = (hh % 12) + 12;

    return hh % 24;
  }

  /*  ControlValueAccessor */
  public writeValue(obj: any): void {
    if (obj == null || obj === '') {
      this.hour = 0;
      this.minute = 0;
      this.displayValue = '';
    } else {
      const parsed = this.hydrateFromText(String(obj));
      if (parsed) {
        this.hour = parsed.hour;
        this.minute = parsed.minute;
      }
      this.displayValue = this.formatToDisplay(this.hour, this.minute);
    }
    if (this.textInputRef?.nativeElement) this.textInputRef.nativeElement.value = this.displayValue;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
