import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className = '',
  formatOptions = {},
  duration = 0.8,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration,
  });

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current) => {
    return new Intl.NumberFormat('en-US', formatOptions).format(Math.round(current));
  });

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

// Variant for decimal numbers (distance, etc.)
interface AnimatedDecimalProps {
  value: number;
  decimals?: number;
  className?: string;
  duration?: number;
}

export function AnimatedDecimal({
  value,
  decimals = 2,
  className = '',
  duration = 0.8,
}: AnimatedDecimalProps) {
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration,
  });

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current) => {
    return current.toFixed(decimals);
  });

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}
