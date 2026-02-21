const MAX_LENGTH = 1000;

/**
 * Escape a string for safe text display. Replaces HTML special characters
 * with entities and truncates to MAX_LENGTH. Never use the output as raw HTML.
 */
export function sanitizeForDisplay(value: unknown): string {
  if (value == null) return '';
  const str = String(value).slice(0, MAX_LENGTH);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
