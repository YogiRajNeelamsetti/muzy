import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

// Extract video ID from YouTube URL
export function extractYouTubeId(url: string): string | null {
    const match = url.match(YT_REGEX);
    return match ? match[1] : null;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }