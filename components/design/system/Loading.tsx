import { ThreeDot } from "react-loading-indicators";

export function Loading() {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <ThreeDot variant="bounce" color="#32cd32" size="medium" text="" textColor="" /> { /* Threedot von hane-smitter nutzen. Ehre, dass es sowas gibt */}
        </div>
    );
}