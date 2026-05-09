'use client';

/**
 * ContainerScroll — 3D card that tilts into place as the user scrolls.
 * From the Aceternity / 21st.dev pattern. Uses framer-motion useScroll +
 * useTransform; ScrollTrigger not required.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ContainerScroll = ({
  titleComponent,
  children,
  className,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.95] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-[64rem] items-center justify-center p-2 md:h-[80rem] md:p-20',
        className
      )}
    >
      <div
        className="relative w-full py-10 md:py-40"
        style={{ perspective: '1000px' }}
      >
        <Header translate={translate}>{titleComponent}</Header>
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  children,
}: {
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div style={{ translateY: translate }} className="div max-w-5xl mx-auto text-center">
      {children}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="mx-auto -mt-12 h-[36rem] w-full max-w-5xl rounded-[24px] border border-border bg-surface/60 p-2 backdrop-blur-md shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-bg/70 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
