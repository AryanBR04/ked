export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, "p")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
