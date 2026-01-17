
import { twMerge } from 'tailwind-merge';

interface CardProps {
    className?: string;
    children: React.ReactNode
}

export default function DashboardCards ({className, children}:CardProps) {
    return (
        <div className={twMerge("p-4 text-black flex justify-center items-center text-2xl border rounded-xl h-full", className)}>
            {children}
        </div>
    )
}
