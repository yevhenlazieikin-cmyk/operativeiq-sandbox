/**
 * Result of profile photo crop aligned with checksheet-2020 {@code EditPhotoComponent.save}:
 * two square images (250×250 and 35×35) with the same logical file name for multipart field {@code filename}.
 */
export interface CrewPhotoCropResult {
  blob250: Blob;
  blob35: Blob;
  fileName: string;
}

export function isCrewPhotoCropResult(value: unknown): value is CrewPhotoCropResult {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const o = value as Record<string, unknown>;

  return o['blob250'] instanceof Blob && o['blob35'] instanceof Blob && typeof o['fileName'] === 'string' && o['fileName'].length > 0;
}
