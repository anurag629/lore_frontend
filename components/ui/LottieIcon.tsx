'use client';

import Lottie from 'lottie-react';
import { CSSProperties } from 'react';

interface LottieIconProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
}

export default function LottieIcon({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style = {},
  onComplete,
}: LottieIconProps) {
  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
      onComplete={onComplete}
    />
  );
}

// Example usage with inline animation data for success checkmark
export const successAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Success Check',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [80, 80] },
              p: { a: 0, k: [0, 0] },
              nm: 'Ellipse',
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.557, 0.894, 0.161, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2,
              nm: 'Stroke',
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: 'Circle Group',
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// Loading spinner animation
export const loadingAnimation = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'Loading',
  ddd: 0,
  assets: [],
  layers: [],
};
