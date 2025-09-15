import { ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare function safeAsyncFunc<T>(func: () => Promise<T>): () => Promise<T | undefined>;
