import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Define o tipo ClassValue localmente
type ClassValue = string | number | boolean | undefined | null | Record<string, any> | ClassValue[];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 