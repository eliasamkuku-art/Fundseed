import React from 'react';
import { motion } from 'motion/react';

const Shimmer = () => (
  <motion.div
    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
    animate={{
      translateX: ["0%", "100%"],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

const SkeletonBase = ({ className }: { className: string }) => (
  <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
    <Shimmer />
  </div>
);

export const SkeletonCard = () => {
  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-8 justify-between flex flex-col gap-8 h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>
        
        <div className="space-y-3">
          <SkeletonBase className="h-7 w-3/4 rounded-lg" />
          <SkeletonBase className="h-4 w-1/2 rounded-md" />
        </div>

        <div className="space-y-4 border-t border-stone-100 pt-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <SkeletonBase className="h-5 w-5 rounded-full shrink-0" />
              <SkeletonBase className="h-4 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-6 flex items-center justify-between gap-4">
        <SkeletonBase className="h-4 w-24 rounded-md" />
        <SkeletonBase className="h-12 w-32 rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonPremiumCard = () => {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <SkeletonBase className="h-4 w-16 rounded uppercase" />
          <SkeletonBase className="h-4 w-4 rounded" />
        </div>
        <div className="space-y-2">
          <SkeletonBase className="h-5 w-full rounded" />
          <SkeletonBase className="h-3 w-1/2 rounded" />
        </div>
        <SkeletonBase className="h-12 w-full rounded" />
      </div>
      <div className="border-t border-stone-100 pt-3.5 flex items-center justify-between gap-2">
        <SkeletonBase className="h-3 w-20 rounded" />
        <SkeletonBase className="h-4 w-12 rounded" />
      </div>
    </div>
  );
};

export const SkeletonRow = () => {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-2.5 flex-1 w-full">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-5 w-20 rounded-full" />
          <SkeletonBase className="h-5 w-24 rounded-full" />
        </div>
        <SkeletonBase className="h-6 w-3/4 rounded" />
        <SkeletonBase className="h-4 w-1/4 rounded" />
      </div>
      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        <SkeletonBase className="h-6 w-32 rounded bg-emerald-50" />
        <SkeletonBase className="h-3 w-16 rounded" />
      </div>
    </div>
  );
};
