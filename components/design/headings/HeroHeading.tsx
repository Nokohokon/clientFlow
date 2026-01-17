import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';
import { Head } from 'next/document';

interface HeadingProps {
    children: ReactNode,
    className?: string,
}

export function HeroHeading({ children, className}: HeadingProps) {
  return (
    <h1 className={twMerge("text-7xl md:text-5xl p-4 font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}