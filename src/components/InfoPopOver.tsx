import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export type InfoPopOverDirection = 'top' | 'bottom' | 'left' | 'right';

interface InfoPopOverProps {
  show: boolean;
  direction?: InfoPopOverDirection;
  children: React.ReactNode;
  className?: string;
}

const directionStyles: Record<InfoPopOverDirection, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function InfoPopOver({ show, direction = 'top', children, className = '' }: InfoPopOverProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: direction === 'top' ? 10 : direction === 'bottom' ? -10 : 0, x: direction === 'left' ? 10 : direction === 'right' ? -10 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: direction === 'top' ? 10 : direction === 'bottom' ? -10 : 0, x: direction === 'left' ? 10 : direction === 'right' ? -10 : 0 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-50 px-3 py-2 rounded shadow-lg bg-gray-900/80 text-white text-xs font-medium pointer-events-none whitespace-pre-line ${directionStyles[direction]} ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
