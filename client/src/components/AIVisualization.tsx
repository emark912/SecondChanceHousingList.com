import React, { useEffect, useState } from 'react';

export const AIVisualization: React.FC = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* SVG Canvas for animated visualization */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-md"
        style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
      >
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center user node */}
        <circle
          cx="200"
          cy="200"
          r="25"
          fill="url(#nodeGradient)"
          filter="url(#glow)"
          className={animate ? 'animate-pulse' : ''}
        />
        <text
          x="200"
          y="208"
          textAnchor="middle"
          fontSize="16"
          fill="white"
          fontWeight="bold"
        >
          YOU
        </text>

        {/* Property nodes around center */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 200 + 120 * Math.cos(rad);
          const y = 200 + 120 * Math.sin(rad);
          const delay = i * 0.1;

          return (
            <g key={i}>
              {/* Connecting line */}
              <line
                x1="200"
                y1="200"
                x2={x}
                y2={y}
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.5"
                className={animate ? 'animate-pulse' : ''}
                style={{
                  animationDelay: `${delay}s`,
                }}
              />

              {/* Property node */}
              <circle
                cx={x}
                cy={y}
                r="15"
                fill="#10b981"
                filter="url(#glow)"
                className={animate ? 'animate-bounce' : ''}
                style={{
                  animationDelay: `${delay}s`,
                }}
              />

              {/* Match percentage indicator */}
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
              >
                {95 - i * 5}%
              </text>
            </g>
          );
        })}

        {/* Animated data flow particles */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`particle-${i}`}
            cx="200"
            cy="200"
            r="4"
            fill="#fbbf24"
            opacity="0.8"
            className="animate-pulse"
            style={{
              animation: `orbit 4s linear infinite`,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}

        {/* Animated circuit pattern background */}
        <g opacity="0.1" stroke="#3b82f6" strokeWidth="1" fill="none">
          <path d="M 50 50 L 350 50 L 350 350 L 50 350 Z" />
          <circle cx="200" cy="200" r="100" />
          <circle cx="200" cy="200" r="150" />
        </g>
      </svg>

      {/* CSS for animations */}
      <style>{`
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(100px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(100px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
};
