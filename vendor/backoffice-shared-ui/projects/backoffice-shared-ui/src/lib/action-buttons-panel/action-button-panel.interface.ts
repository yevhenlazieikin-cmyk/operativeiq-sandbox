export interface ActionButton {
  name: string;
  disabled?: boolean;
  actionCB(...args: any[]): any;
}
