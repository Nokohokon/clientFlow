import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';
import { Head } from 'next/document';

interface HeadingProps {
    children: ReactNode,
    className?: string,
}

export function Heading4({ children, className}: HeadingProps) {
  return (
    <h1 className={twMerge("text-xl sm:text-2xl lg:text-3xl ", className)}>
      {children}
    </h1>
  );
}