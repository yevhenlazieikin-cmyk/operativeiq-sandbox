import moment from 'moment';
import Inputmask from 'inputmask';

import { createMask, InputmaskOptions } from '@ngneat/input-mask';
import Options = Inputmask.Options;

const numericParser = (value: string) => {
  const updatedValue = value.replace(/[, ]+/g, '').trim();

  return updatedValue;
};

const preventAddingZero = (event: KeyboardEvent, buffer: string[], caretPos: { begin: number; end: number }, opts: Options) => {
  if (event.code === 'KeyM' || event.code === 'KeyK') {
    event.preventDefault();
  }
};

export const DateInputMask = (format: string, formatValue: number) =>
  createMask<any>({
    alias: 'datetime',
    inputFormat: format.toLowerCase(),
    placeholder: format.toUpperCase(),
    parser: (value: string) => {
      const values = value.split('/');
      const year = values[2];
      const date = formatValue ? values[0] : values[1];
      const month = formatValue ? values[1] : values[0];
      const updatedDate = moment(`${year}-${month}-${date}`);

      return updatedDate.isValid() ? updatedDate : null;
    },
    isComplete: (buffer: string[], opts: Options) => !(buffer.includes('D') || buffer.includes('M') || buffer.includes('Y')),
    formatter: (value: Date) => new Date(value),
    clearIncomplete: true,
    showMaskOnHover: false
  });

export const NumberSeparator2 = createMask<string>({
  alias: 'numeric',
  digits: 2,
  groupSeparator: ',',
  digitsOptional: true,
  rightAlign: false,
  allowMinus: false,
  parser: (value: string) => numericParser(value),
  onKeyDown: (event: KeyboardEvent, buffer: string[], caretPos: { begin: number; end: number }, opts: Options) =>
    preventAddingZero(event, buffer, caretPos, opts)
});

export const NumberWithMaxValue = (max = null): InputmaskOptions<string> =>
  createMask<string>({
    alias: 'numeric',
    digits: 0,
    groupSeparator: ',',
    digitsOptional: true,
    rightAlign: false,
    allowMinus: false,
    placeholder: '',
    max: '',
    showMaskOnHover: false,
    parser: (value: string) => numericParser(value),
    onKeyDown: (event: KeyboardEvent, buffer: string[], caretPos: { begin: number; end: number }, opts: Options) =>
      preventAddingZero(event, buffer, caretPos, opts)
  });

export const NumberSeparator2WithNegative = createMask<string>({
  alias: 'numeric',
  digits: 2,
  groupSeparator: ',',
  digitsOptional: true,
  rightAlign: false,
  allowMinus: true,
  parser: (value: string) => numericParser(value),
  onKeyDown: (event: KeyboardEvent, buffer: string[], caretPos: { begin: number; end: number }, opts: Options) =>
    preventAddingZero(event, buffer, caretPos, opts)
});

export const NumericWithMinus = createMask<number>({
  mask: '[-]9{1,2}[.99]{0,1}',
  radixPoint: '.',
  digits: 2,
  digitsOptional: true,
  allowMinus: true,
  rightAlign: false,
  placeholder: ''
});

export const NumberSeparator3 = createMask<string>({
  alias: 'numeric',
  digits: 3,
  groupSeparator: ',',
  digitsOptional: true,
  rightAlign: false,
  allowMinus: false,
  parser: (value: string) => numericParser(value),
  onKeyDown: (event: KeyboardEvent, buffer: string[], caretPos: { begin: number; end: number }, opts: Options) =>
    preventAddingZero(event, buffer, caretPos, opts)
});

export const dinNumberMask = createMask({
  alias: 'din',
  mask: 'A|a9999 99 999999[ [99[9|A|a]]',
  definitions: {
    A: {
      validator: '[A-Za-z]',
      casing: 'upper'
    },
    a: {
      validator: '[a-z]',
      casing: 'lower'
    }
  },
  parser: (value: string) => {
    const updatedValue = value.replace(/[_ ]/g, '');

    return updatedValue;
  },
  placeholder: '',
  autoUnmask: true,
  showMaskOnHover: false,
  showMaskOnFocus: false
});
