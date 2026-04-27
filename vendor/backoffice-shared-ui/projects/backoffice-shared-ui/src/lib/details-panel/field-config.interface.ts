import { TemplateRef } from '@angular/core';
import { FieldType } from './field-type.enum';

export interface FieldConfig {
  label: string;
  type: FieldType;
  formControlName: string;
  options?: { label: string; value: string }[];
  customTemplate?: TemplateRef<any>;
  fullWidth?: boolean;
  hint?: string;
  customRequiredValidationMessage?: string;
  customDuplicatedValidationMessage?: string;
  customRangeValidationMessage?: string;
  customPatternValidationMessage?: string;
  minLength?: number;
  customValidationMessages?: Record<string, string>;
  maxLength?: number;
  timeFormat?: '12' | '24';
  allowFormatToggle?: boolean;
  hasMultipleValues?: boolean;
  placeholderLabel?: string;
  onEntitySelect?: (field: FieldConfig) => void;
  onClear?: (field?: FieldConfig) => void;
  onClick?: (field: FieldConfig, event?: MouseEvent) => void;
  required?: boolean;
  typeOfData?: 'date';
  dateFormat?: string;
  isLocalDate?: boolean;
  validationStrategy?: ValidationStrategy;
  customClearOnEntitySelect?: boolean;
  customClassFn?: () => string | string[] | Record<string, boolean>;
}

export interface CustomHeaderButton {
  label: string;
  state: boolean;
  action: (data?: any) => any;
}

export type ValidationStrategy = 'submit' | 'change' | 'touched' | 'default';
