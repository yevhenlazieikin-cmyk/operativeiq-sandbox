import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmsEntityAttachmentsContext {
  entityId?: number;
  type?: AttachmentBufferTypeEnum;
  uniqueId?: string;
  file: File;
}

export enum AttachmentBufferTypeEnum {
  UnitQuestion = 1,
  FacilityQuestion = 2
}

export interface EntityAttachUpload {
  files?: File[];
  entityId?: number;
  multipleEntities?: [
    {
      entityId: number;
      files: File[];
    }
  ];
}

export interface UploadFileData<T, R = unknown> {
  context?: T;
  method(file: File, entityId?: number): Observable<HttpEvent<R>>;
}
