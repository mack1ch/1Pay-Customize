export const FONT_OPTIONS: { value: string; label: string; stack: string }[] = [
  { value: 'Inter', label: 'Inter', stack: "'Inter', system-ui, sans-serif" },
  { value: 'Roboto', label: 'Roboto', stack: "'Roboto', system-ui, sans-serif" },
  {
    value: 'Open Sans',
    label: 'Open Sans',
    stack: "'Open Sans', system-ui, sans-serif",
  },
  { value: 'Lato', label: 'Lato', stack: "'Lato', system-ui, sans-serif" },
  {
    value: 'Montserrat',
    label: 'Montserrat',
    stack: "'Montserrat', system-ui, sans-serif",
  },
  {
    value: 'Nunito Sans',
    label: 'Nunito Sans',
    stack: "'Nunito Sans', system-ui, sans-serif",
  },
  {
    value: 'Source Sans 3',
    label: 'Source Sans 3',
    stack: "'Source Sans 3', system-ui, sans-serif",
  },
  { value: 'DM Sans', label: 'DM Sans', stack: "'DM Sans', system-ui, sans-serif" },
  { value: 'Rubik', label: 'Rubik', stack: "'Rubik', system-ui, sans-serif" },
  {
    value: 'Work Sans',
    label: 'Work Sans',
    stack: "'Work Sans', system-ui, sans-serif",
  },
  { value: 'Manrope', label: 'Manrope', stack: "'Manrope', system-ui, sans-serif" },
];

export function fontStackFor(name: string): string {
  return FONT_OPTIONS.find((f) => f.value === name)?.stack ?? FONT_OPTIONS[0].stack;
}
