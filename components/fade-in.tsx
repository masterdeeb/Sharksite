'use client';

import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeIn({ children, delay = 0, className = "", direction = 'up' }: FadeInProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
