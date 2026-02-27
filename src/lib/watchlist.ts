export function mergeWatchlists(
  primary: string[],
  defaults: string[]
): string[] {
  const ordered = [
    ...primary.map((t) => t.toUpperCase()),
    ...defaults.map((t) => t.toUpperCase()),
  ];
  const seen = new Set<string>();
  return ordered.filter((t) => {
    if (!t || seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}
