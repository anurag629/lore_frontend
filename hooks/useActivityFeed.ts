'use client';

import { useState, useEffect } from 'react';

export interface Activity {
  id: string;
  type: 'mint' | 'earning' | 'remix';
  user: string;
  action: string;
  icon: string;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'mint', user: 'Sarah M.', action: 'just minted "Digital Dreams"', icon: '🎨' },
  { id: '2', type: 'earning', user: 'Alex K.', action: 'earned $120 in royalties', icon: '💰' },
  { id: '3', type: 'remix', user: 'Mike P.', action: 'created a remix of "Cyber City"', icon: '🔄' },
  { id: '4', type: 'mint', user: 'Emma L.', action: 'just minted "Neon Nights"', icon: '🎨' },
  { id: '5', type: 'earning', user: 'John D.', action: 'earned $85 in royalties', icon: '💰' },
  { id: '6', type: 'remix', user: 'Lisa W.', action: 'created a remix of "Abstract Flow"', icon: '🔄' },
  { id: '7', type: 'mint', user: 'David R.', action: 'just minted "Pixel Paradise"', icon: '🎨' },
  { id: '8', type: 'earning', user: 'Sophie T.', action: 'earned $200 in royalties', icon: '💰' },
  { id: '9', type: 'remix', user: 'Chris H.', action: 'created a remix of "Tech Wave"', icon: '🔄' },
  { id: '10', type: 'mint', user: 'Rachel B.', action: 'just minted "Future Vision"', icon: '🎨' },
];

export function useActivityFeed(intervalMs: number = 12000) {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    // Show first activity after 3 seconds
    const initialTimeout = setTimeout(() => {
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      setActivity(randomActivity);
    }, 3000);

    // Then show new activities at the specified interval
    const interval = setInterval(() => {
      const randomActivity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
      setActivity(randomActivity);
    }, intervalMs);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return activity;
}
