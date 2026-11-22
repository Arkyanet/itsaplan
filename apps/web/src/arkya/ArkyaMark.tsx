import { useId } from 'react';

// The Arkya blade mark, from arkya-website (apps/web/public/arkya-mark.svg).
export default function ArkyaMark({ className }: { className?: string }) {
  const id = `arkya-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg viewBox="0 0 162 113" role="img" aria-label="Arkya" className={className}>
      <defs>
        <linearGradient id={id} x1="80" y1="0" x2="80" y2="113" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9B38" />
          <stop offset="0.45" stopColor="#FF4500" />
          <stop offset="0.81" stopColor="#C93600" />
        </linearGradient>
      </defs>
      <path
        d="M0 112.669L28.677 112.66C34.205 112.66 38.945 109.448 41.53 104.699L100.945 0L71.537 0.032C66.409 0.038 62.031 2.865 59.292 7.038L0 112.669Z"
        fill={`url(#${id})`}
      />
      <path
        d="M120.233 104.405C122.887 109.4 127.618 112.65 133.259 112.659L161.949 112.7L125.159 47.155C122.465 42.166 117.494 39.235 111.806 39.216L83.264 39.254L120.236 104.402Z"
        fill={`url(#${id})`}
      />
      <path
        d="M43.03 112.686L71.505 112.717C77.245 112.522 82.045 109.474 84.701 104.45L99.354 78.619H70.91C65.675 78.613 61.297 81.182 58.322 85.408L43.027 112.686Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
