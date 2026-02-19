'use client';

import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

export default function Loading() {
  return (
    <output className="flex items-center justify-center min-h-[50dvh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className={cn('size-6 rounded-full border-2', 'border-muted border-t-primary')}
      />
      <span className="sr-only">Loading</span>
    </output>
  );
}
