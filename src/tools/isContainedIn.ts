/* eslint-disable @typescript-eslint/no-explicit-any */
export function isContainedIn(
  source: Record<string, any>,
  target: Record<string, any>
) {
  if (source === target) return true;
  if (source === null || target === null) return false;
  if (typeof source !== "object" || typeof target !== "object")
    return source === target;

  const sourceKeys = Object.keys(source);

  for (const key of sourceKeys) {
    if (!Object.prototype.hasOwnProperty.call(target, key)) return false;

    if (typeof source[key] === "object" && source[key] !== null) {
      if (!isContainedIn(source[key], target[key])) return false;
    } else if (source[key] !== target[key]) {
      return false;
    }
  }

  return true;
}
