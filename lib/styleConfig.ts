/**
 * Helper functions for style parsing and validation
 */

// Allowed font sizes
const ALLOWED_FONT_SIZES = new Set([
  "10px",
  "11px",
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "17px",
  "18px",
  "19px",
  "20px",
  "24px",
  "30px",
  "36px",
  "48px",
  "60px",
  "72px",
]);

/**
 * Parses and validates font size
 */
export function parseAllowedFontSize(fontSize: string): string {
  // Check if the font size is in the allowed set
  if (!fontSize || !ALLOWED_FONT_SIZES.has(fontSize)) {
    return "";
  }
  return fontSize;
}

/**
 * Regex for validating RGB color format
 */
const RGB_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

/**
 * Parses and validates color in RGB format
 */
export function parseAllowedColor(color: string): string {
  if (!color) {
    return "";
  }

  const match = RGB_REGEX.exec(color);
  if (!match) {
    return "";
  }

  // Extract RGB values
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // Validate RGB ranges
  if (
    isNaN(r) ||
    r < 0 ||
    r > 255 ||
    isNaN(g) ||
    g < 0 ||
    g > 255 ||
    isNaN(b) ||
    b < 0 ||
    b > 255
  ) {
    return "";
  }

  return color;
}
