/** Server-returned attachment metadata (read-only, download only) */
export interface CommentAttachmentMetadata {
  id?: number;
  originalFileName: string;
  downloadUrl?: string;
  sortOrder?: number;
  uploadedByCrewId?: number;
  isOwnerComment?: boolean;
}

export type CommentAttachment = File | CommentAttachmentMetadata;

export function isCommentAttachmentMetadata(a: CommentAttachment): a is CommentAttachmentMetadata {
  return typeof a === 'object' && a !== null && 'originalFileName' in a && !(a instanceof File);
}

export interface Comment {
  author: string;
  authorId?: number;
  status?: string;
  comment: string;
  timestamp: Date;
  attachments?: CommentAttachment[];
}
