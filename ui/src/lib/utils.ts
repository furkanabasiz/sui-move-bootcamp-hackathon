import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(timestamp: number): string {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function calculatePercentage(votes: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

export function isVotingActive(endTime?: number): boolean {
  if (!endTime) return true;
  return Date.now() < endTime;
}

export function getExplorerLink(id: string, type: 'object' | 'txn' | 'address', network: string): string {
  const baseUrl = `https://suiscan.xyz/${network}`;
  return `${baseUrl}/${type}/${id}`;
}