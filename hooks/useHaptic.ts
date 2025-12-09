'use client';

/**
 * Hook for haptic feedback on mobile devices
 * Provides tactile feedback for user interactions
 */
export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof window === 'undefined') return;

    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    // Light tap (10ms)
    light: () => vibrate(10),

    // Medium tap (20ms)
    medium: () => vibrate(20),

    // Heavy tap (30ms)
    heavy: () => vibrate(30),

    // Success pattern (short-pause-short)
    success: () => vibrate([10, 50, 10]),

    // Error pattern (longer vibration)
    error: () => vibrate(50),

    // Warning pattern (two short taps)
    warning: () => vibrate([15, 30, 15]),

    // Selection pattern (very short)
    selection: () => vibrate(5),

    // Custom pattern
    custom: (pattern: number | number[]) => vibrate(pattern),
  };
}
