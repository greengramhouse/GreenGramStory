import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtml(html: string) {
  return html
    ?.replace(/<[^>]*>?/gm, '') // Remove tags
    .replace(/&nbsp;/g, ' ')   // Replace non-breaking spaces
    .replace(/&amp;/g, '&')    // Replace ampersands
    .replace(/&lt;/g, '<')     // Replace <
    .replace(/&gt;/g, '>')     // Replace >
    .replace(/&quot;/g, '"')   // Replace "
    .replace(/&#39;/g, "'")    // Replace '
    ?? "";
}
