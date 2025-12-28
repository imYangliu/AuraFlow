import React from 'react';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function CircularProgress({ 
  progress, 
  size = 200, 
  strokeWidth = 10, 
  color = '#4caf50',
  children 
}: CircularProgressProps) {
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = ((1 - progress) * circumference);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="#e6e6e6"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          stroke={color}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
      }}>
        {children}
      </div>
    </div>
  );
}
