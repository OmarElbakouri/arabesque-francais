import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `http://localhost:8080/${cleanPath}`;
}
