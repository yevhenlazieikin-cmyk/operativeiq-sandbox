import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../details-panel/field-config.interface';
import { menuType } from '../header/menu-type.enum';

export interface DialogButton {
  autoClose?: boolean;
  label: string;
  action: string;
  cssClass?: string;
  disabled?: boolean | (() => boolean);
  color?: string;
  actionCallback?(...args: any[]): any;
}

export interface DialogConfig {
  title: string;
  fields: FieldConfig[];
  form: FormGroup;
  buttons?: DialogButton[];
  userMenu?: menuType;
  width?: string;
  height?: string;
  subTitle?: string;
}

export interface DialogResult {
  action: string;
  data?: Record<string, any>;
}
