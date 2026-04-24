export interface FileValidatorOptions {
  regExp: RegExp;
  maxSize?: number;
  expected: {
    size?: string;
    extension?: string;
  };
  fileTypes?: string[];
}
