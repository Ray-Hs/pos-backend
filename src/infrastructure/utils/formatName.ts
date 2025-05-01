export function formatName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-z0-9.-]/g, "") // Remove special characters except dots and dashes
    .replace(/-+/g, "-"); // Remove duplicate dashes
}
