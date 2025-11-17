import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Chrome extension specific utilities
export const storage = {
  get: async <T>(key: string): Promise<T | null> => {
    const result = await chrome.storage.local.get(key)
    return result[key] ?? null
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    await chrome.storage.local.set({ [key]: value })
  },
  remove: async (key: string): Promise<void> => {
    await chrome.storage.local.remove(key)
  },
}

// Debounce for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
