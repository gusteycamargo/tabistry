/* eslint-disable @typescript-eslint/no-explicit-any */
export function deepEqual(
  source: Record<string, any>,
  target: Record<string, any>,
) {
  if (source === target) return true

  if (source === null || target === null) return false
  if (typeof source !== 'object' || typeof target !== 'object') return false

  const sourceKeys = Object.keys(source)
  const targetKeys = Object.keys(target)

  if (sourceKeys.length !== targetKeys.length) return false

  for (const key of sourceKeys) {
    if (!targetKeys.includes(key)) return false
    if (!deepEqual(source[key], target[key])) return false
  }

  return true
}
