import { ChangeDetectorRef, Component, ElementRef, inject, Input, input, OnChanges, output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralConst } from '../grid/constants';
import { SeparatorPipe } from '../shared/pipes/separator.pipe';

@Component({
  selector: 'bo-counter',
  standalone: true,
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  imports: [CommonModule, SeparatorPipe]
})
export class CounterComponent implements OnChanges {
  @ViewChild('inputField', { static: true }) public input!: ElementRef;
  public btnDecrement = true;

  public disabled = input<any>();
  public minValue = input<number>(0);
  public maxValue = input<number>(GeneralConst.COUNTER_CONTROL_DEFAULT_MAX_VALUE);
  public readonly counterChangeValue = output<any>();

  /*TODO rewrite into more correct signal and set correct type*/
  @Input() btnIncrement = true;
  @Input() counter: any;
  private currentValue: any;

  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['counter'] && changes['counter'].currentValue !== +this.currentValue) {
      this.initSettings();
      const value = this._processValue(changes['counter'].currentValue);

      this.counter = +value;
      this.currentValue = this.counter;
      this.counterChangeValue.emit(this.counter);
    }
  }

  initSettings(): void {
    if (this.minValue() === this.maxValue()) {
      this.disableAll();
    } else if (+this.counter === this.minValue()) {
      this.disableDec();
    } else if (+this.counter === this.maxValue()) {
      this.disableInc();
    } else {
      this.enableAll();
    }
  }

  decrement(): void {
    const value = this.counter?.toString().replace(',', '');
    if (value > this.minValue()) {
      this.currentValue = +value - 1;
      this.counterChangeValue.emit(+value - 1);

      if (+value - 1 === this.minValue()) {
        this.btnDecrement = false;
      }
    }
    this.btnIncrement = true;
    this.cdr.detectChanges();
  }

  increment(): void {
    const value = this.counter?.toString().replace(',', '');
    if (value < this.maxValue()) {
      this.currentValue = +value + 1;
      this.counterChangeValue.emit(+value + 1);

      if (+value + 1 === this.maxValue()) {
        this.btnIncrement = false;
      }
    }
    this.btnDecrement = true;
    this.cdr.detectChanges();
  }

  /* TODO set correct input type */
  onInput(e: any): void {
    let value = e.target.value.replace(/[^0-9]/g, '');
    value = this._processValue(value);

    e.target.value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.currentValue = value;
    this.counterChangeValue.emit(+value);
  }

  disableAll() {
    this.btnIncrement = false;
    this.btnDecrement = false;
  }

  disableDec() {
    this.btnIncrement = true;
    this.btnDecrement = false;
  }

  disableInc() {
    this.btnIncrement = false;
    this.btnDecrement = true;
  }

  enableAll() {
    this.btnIncrement = true;
    this.btnDecrement = true;
  }

  private _processValue(value: string | number): number {
    if (this.minValue() === this.maxValue()) {
      value = this.minValue();
      this.disableAll();
    } else if (+value < this.minValue()) {
      value = this.minValue();
      this.disableDec();
    } else if (+value === this.minValue()) {
      if (value === '00') {
        value = 0;
      }
      this.disableDec();
    } else if (+value === this.maxValue()) {
      this.disableInc();
    } else if (+value > this.maxValue()) {
      value = this.maxValue();
      this.disableInc();
    } else {
      this.enableAll();
    }

    return value as number;
  }
}
