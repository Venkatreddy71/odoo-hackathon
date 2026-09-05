import React from 'react';

export default function Skeleton({ className = '', height, width, count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`bg-slate-800/60 animate-pulse rounded-xl ${className}`}
          style={{
            height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
            width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
          }}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-28 bg-slate-800 rounded"></div>
        <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-8 w-20 bg-slate-800 rounded-lg"></div>
      <div className="h-3 w-36 bg-slate-800/70 rounded"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
      <div className="h-10 bg-slate-800/80 rounded-xl w-full"></div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-6 bg-slate-800/60 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
