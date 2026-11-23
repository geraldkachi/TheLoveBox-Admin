/** Read a colour from src/theme.css at runtime (for charts and libraries that need real colour values). */
export const cssColor = (name: string, alpha = 1) => {
  const raw = typeof window !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : "";
  return raw ? `rgb(${raw} / ${alpha})` : "currentColor";
};
/** For inline styles (react-select etc.) a CSS var reference is enough. */
export const v = (name: string, alpha = 1) => `rgb(var(${name}) / ${alpha})`;
