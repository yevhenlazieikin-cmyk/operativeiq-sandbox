export enum FieldType {
  ReadOnly = 'readonly',
  TextField = 'text',
  NumberField = 'number',
  SelectEntity = 'select-entity',
  Checkbox = 'checkbox',
  InputWithSelect = 'input-with-select',
  DatePicker = 'date',
  TimePicker = 'time',
  Radio = 'radio',
  Select = 'select',
  TextArea = 'textarea',
  CustomTemplate = 'custom',
  FileUploader = 'file',
  ImagePreview = 'image',
  ReadOnlyDate = 'readonly-date',
  Password = 'password'
}

export enum ValidationAction {
  Validate = 'VALIDATE',
  Clear = 'CLEAR'
}
