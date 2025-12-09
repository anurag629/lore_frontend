'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function GradientOrbs() {
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbsRef.current) return;

    const orbs = orbsRef.current.querySelectorAll('.gradient-orb');

    orbs.forEach((orb, index) => {
      // Create floating animation
      gsap.to(orb, {
        y: `+=${30 + index * 10}`,
        x: `+=${20 + index * 5}`,
        duration: 3 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.3,
      });

      // Create rotation animation
      gsap.to(orb, {
        rotation: 360,
        duration: 20 + index * 5,
        repeat: -1,
        ease: 'none',
      });

      // Create scale pulse
      gsap.to(orb, {
        scale: 1.1 + index * 0.05,
        duration: 4 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.2,
      });
    });

    return () => {
      gsap.killTweensOf(orbs);
    };
  }, []);

  return (
    <div ref={orbsRef} className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="gradient-orb absolute w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{
          top: '10%',
          left: '5%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(234,88,12,0.2) 50%, transparent 100%)',
        }}
      />
      <div
        className="gradient-orb absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          top: '60%',
          right: '10%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(236,72,153,0.2) 50%, transparent 100%)',
        }}
      />
      <div
        className="gradient-orb absolute w-72 h-72 rounded-full blur-3xl opacity-25"
        style={{
          bottom: '20%',
          left: '15%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.3) 0%, rgba(239,68,68,0.2) 50%, transparent 100%)',
        }}
      />
      <div
        className="gradient-orb absolute w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{
          top: '40%',
          left: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(147,51,234,0.2) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
