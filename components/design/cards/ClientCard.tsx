
import { twMerge } from 'tailwind-merge';

interface CardProps {
    className?: string; // Is halt nen string was soll ich sagen
    children: React.ReactNode // Werden ja schließlich Komponenten / JSX übergeben
}

export default function ClientCard ({className, children}:CardProps) {
    return (
        <div className={twMerge("p-4 text-black flex flex-col text-2xl border rounded-xl h-full", className)}>
            {children}
        </div>
    )
}
