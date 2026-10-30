import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse border border-neutral-800">
      <div className="aspect-[2/3] w-full bg-neutral-800/60"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
        <div className="flex items-center gap-2">
          <div className="h-3 bg-neutral-800 rounded w-1/4"></div>
          <div className="h-3 bg-neutral-800 rounded w-1/4"></div>
        </div>
        <div className="h-8 bg-neutral-800/80 rounded-lg w-full mt-2"></div>
      </div>
    </div>
  );
};

export const MovieGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <MovieCardSkeleton key={idx} />
      ))}
    </div>
  );
};
