import { colors } from '../colors';

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

describe('WCAG AA contrast (4.5:1 minimum for normal text)', () => {
  it('link text on a white background meets AA', () => {
    expect(contrastRatio(colors.linkText, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('muted text on a white background meets AA', () => {
    expect(contrastRatio(colors.mutedText, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('muted text on the image-fallback background meets AA', () => {
    expect(contrastRatio(colors.mutedText, colors.imageFallbackBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it('danger text on a white background meets AA', () => {
    expect(contrastRatio(colors.dangerText, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('WCAG non-text contrast (3:1 minimum for UI component boundaries)', () => {
  it('card border on a white background meets the non-text minimum', () => {
    expect(contrastRatio(colors.cardBorder, '#ffffff')).toBeGreaterThanOrEqual(3);
  });
});
