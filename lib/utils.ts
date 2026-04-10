export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function createShareToken() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
