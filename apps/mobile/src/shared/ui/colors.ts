// Centralized color literals so WCAG contrast can be verified once, in
// colors.test.ts, instead of being re-checked by eye in every component that
// uses them. See AGENTS.md §6 ("adequate contrast").
export const colors = {
  linkText: '#007a3d',
  mutedText: '#6b6b6b',
  imageFallbackBackground: '#eeeeee',
  dangerText: '#b00020',
  cardBorder: '#8c8c8c',
};
