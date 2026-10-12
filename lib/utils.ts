import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...args: ClassValue[]) => twMerge(clsx(args));
export const EASE = [0.16, 1, 0.3, 1] as const;
