import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function cn(...inputs: ClassValue[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return twMerge(clsx(inputs))
}


/**
 * Toggles an item in an array. 
 * 
 * If the item exists in the array, it will filter it out.
 * If the item doesn't exist, it will add it.
 * 
 * @param arr - The array to toggle the item in 
 * @param value - The item to toggle
 * @returns The updated array
 */
export const toggleInArray = <T,>(arr: T[], value: T): T[] => {
  return arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
};