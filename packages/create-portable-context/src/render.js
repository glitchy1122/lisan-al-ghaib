/**
 * Tiny {{var}} template renderer. Missing keys become empty string.
 * @param {string} template
 * @param {Record<string, string>} vars
 */
export function renderTemplate(template, vars) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
  });
}
