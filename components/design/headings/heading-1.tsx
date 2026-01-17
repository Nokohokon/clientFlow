import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';
import { Head } from 'next/document';

interface HeadingProps {
    children: ReactNode,
    className?: string,
}

export function Heading1({ children, className}: HeadingProps) {
  return (
    <h1 className={twMerge("text-4xl sm:text-6xl lg:text-7xl underline font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}