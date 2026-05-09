'use client';

/**
 * LampContainer — adapted from Aceternity. Cyan replaced by accent (#d4a843).
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'relative z-0 flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-bg',
        className
      )}
    >
      <div className="relative isolate z-0 flex w-full flex-1 scale-y-125 items-center justify-center">
        {/* right cone */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          style={{
            backgroundImage:
              'conic-gradient(from 70deg at center top, #d4a843, transparent, transparent)',
          }}
          className="absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible"
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-bg [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-bg [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* left cone */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          style={{
            backgroundImage:
              'conic-gradient(from 290deg at center top, transparent, transparent, #d4a843)',
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem]"
        >
          <div className="absolute bottom-0 right-0 z-20 h-full w-40 bg-bg [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-full bg-bg [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* base layers */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-bg blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-accent/40 opacity-50 blur-3xl" />

        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '16rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-accent blur-2xl"
        />
        <motion.div
          initial={{ width: '15rem' }}
          whileInView={{ width: '30rem' }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-accent"
        />

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-bg" />
      </div>

      <div className="relative z-50 -translate-y-72 flex flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
