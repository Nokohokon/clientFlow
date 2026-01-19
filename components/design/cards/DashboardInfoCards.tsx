
import { twMerge } from 'tailwind-merge';

interface CardProps {
    className?: string; // Is halt nen string was soll ich sagen
    children: React.ReactNode // Werden ja schließlich Komponenten / JSX übergeben
}

export default function DashboardCards ({className, children}:CardProps) {
    return (
        <div className={twMerge("p-4 text-black flex justify-center items-center text-2xl border rounded-xl h-full", className)}> { /* Merge die einzelnen Teile zusammen: einmal allgemeines layout und einmal anpassungen. weil is ja tolles individuelles design und so */}
            {children} 
        </div>
    )
}
