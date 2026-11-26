import {motion, useReducedMotion} from 'motion/react';
import type {ReactNode} from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  yOffset = 22,
  duration = 0.55,
  className = '',
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{opacity: 0, y: yOffset}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.04}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
