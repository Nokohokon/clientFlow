import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';
import { Head } from 'next/document';

interface HeadingProps {
    children: ReactNode,
    className?: string,
}

export function Heading2({ children, className}: HeadingProps) {
  return (
    <h1 className={twMerge("text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}