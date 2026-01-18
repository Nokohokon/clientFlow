import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';
import { Head } from 'next/document';

interface HeadingProps {
    children: ReactNode,
    className?: string,
}

export function Heading3({ children, className}: HeadingProps) {
  return (
    <h1 className={twMerge("text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}