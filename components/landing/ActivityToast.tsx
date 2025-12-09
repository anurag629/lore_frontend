'use client';

import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useActivityFeed } from '@/hooks/useActivityFeed';

export function ActivityNotifications() {
  const activity = useActivityFeed(12000); // Show new activity every 12 seconds

  useEffect(() => {
    if (activity) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-sm w-auto glass-enhanced shadow-lg rounded-full pointer-events-auto flex items-center ring-1 ring-white/10 px-4 py-2`}
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 text-base">
                {activity.icon}
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-white">
                  {activity.user}
                </p>
                <p className="text-xs text-slate-300">
                  {activity.action}
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="ml-3 text-xs text-slate-400 hover:text-white focus:outline-none transition-colors"
            >
              ✕
            </button>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-center',
        }
      );
    }
  }, [activity]);

  return (
    <Toaster
      position="top-center"
      containerStyle={{
        top: 80,
      }}
      toastOptions={{
        className: '',
        style: {
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  );
}
