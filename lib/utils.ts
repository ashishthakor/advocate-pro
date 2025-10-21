import { useState, useEffect } from 'react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Case status configuration with colors and labels
 */
export const CASE_STATUS_CONFIG = {
  waiting_for_action: {
    label: 'Waiting For Action',
    color: 'warning' as const,
    icon: '⏳'
  },
  neutrals_needs_to_be_assigned: {
    label: 'Neutrals Needs to be Assigned',
    color: 'info' as const,
    icon: '👥'
  },
  consented: {
    label: 'Consented',
    color: 'success' as const,
    icon: '✅'
  },
  closed_no_consent: {
    label: 'Closed No Consent',
    color: 'error' as const,
    icon: '❌'
  },
  close_no_settlement: {
    label: 'Close No Settlement',
    color: 'error' as const,
    icon: '🚫'
  },
  temporary_non_starter: {
    label: 'Temporary Non Starter',
    color: 'default' as const,
    icon: '⏸️'
  },
  settled: {
    label: 'Settled',
    color: 'success' as const,
    icon: '🎉'
  },
  hold: {
    label: 'Hold',
    color: 'warning' as const,
    icon: '⏸️'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'default' as const,
    icon: '↩️'
  }
} as const;

/**
 * Get status configuration for a given status
 */
export function getStatusConfig(status: string) {
  return CASE_STATUS_CONFIG[status as keyof typeof CASE_STATUS_CONFIG] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    color: 'default' as const,
    icon: '📋'
  };
}
