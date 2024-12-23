"use client";

import Grid from "./components/grid";
import { toast } from "sonner";

export default function Home() {
    const handlePathFound = ({
        success,
        executionTime,
        type,
    }: {
        success: boolean;
        executionTime: number;
        type: "Iterative" | "Recursive";
    }) => {
        if (success) {
            toast("Path found!", {
                description: `Running time: ${executionTime.toFixed(
                    2
                )} ms (${type})`,
                duration: 10000,
            });
        } else {
            toast("No valid path found!", {
                duration: 10000,
            });
        }
    };

    return (
        <div className="flex flex-col items-center h-screen gap-4 p-8">
            <h1 className="text-6xl font-bold">A* Pathfinding Algorithm</h1>
            <Grid onPathFound={handlePathFound} />
        </div>
    );
}
