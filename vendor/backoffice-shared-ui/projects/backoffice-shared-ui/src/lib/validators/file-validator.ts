import { AbstractControl, ValidatorFn } from '@angular/forms';
import { FileValidatorOptions } from '@backoffice/shared-ui/lib/validators/file-validator-options.interface';

export const ACCEPTED_IMAGE_FILE_TYPES = 'image/*';
export const ALLOWED_IMAGE_FILE_TYPES_REG = /^(images\/)/;
export const ALLOWED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.gif,.svg';

export const fileValidator =
  ({ regExp, maxSize, expected, fileTypes }: FileValidatorOptions): ValidatorFn =>
  (control: AbstractControl) => {
    const file: File = control.value;

    if (!file || !(file instanceof File)) {
      return null;
    }

    const sizeError = { fileSize: { expected: expected.size } };
    const extensionError = { fileExtension: { expected: expected.extension } };

    const size = maxSize && file.size > maxSize ? sizeError : null;
    let extension;

    if (fileTypes && regExp) {
      const type = file.type.split('/')[0];

      if (fileTypes.some(fileType => fileType === type)) {
        extension = null;
      } else {
        extension = regExp.test(file?.name.toLowerCase()) ? null : extensionError;
      }
    } else if (regExp) {
      extension = regExp.test(file?.name.toLowerCase()) ? null : extensionError;
    }

    return size || extension ? { ...size, ...extension } : null;
  };
