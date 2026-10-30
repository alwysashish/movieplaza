import { useState, useEffect } from 'react';

export function useCountdown(targetTimestamp: number | null, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!targetTimestamp) return 0;
    return Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!targetTimestamp) {
      setSecondsLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetTimestamp - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  // Based on standard 5-min (300 sec) lock
  const progressPercent = Math.min(100, Math.max(0, (secondsLeft / 300) * 100));

  return {
    secondsLeft,
    formatted,
    isExpired: targetTimestamp !== null && secondsLeft <= 0,
    progressPercent
  };
}
