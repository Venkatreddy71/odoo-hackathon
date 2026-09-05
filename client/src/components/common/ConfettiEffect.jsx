import React, { useEffect, useState } from 'react';

export default function ConfettiEffect({ duration = 4000, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
    const pCount = 50;
    const generated = Array.from({ length: pCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage horizontal
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
      speed: Math.random() * 2 + 2,
    }));

    setParticles(generated);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-bounce"
          style={{
            left: `${p.x}%`,
            top: `-20px`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `fall ${p.speed}s linear forward`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
