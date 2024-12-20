import Grid from "./components/grid";

export default function Home() {
    return (
        <div className="flex flex-col items-center h-screen gap-4 p-8">
            <h1 className="text-6xl font-bold">A* Pathfinding Algorithm</h1>
            <Grid />
        </div>
    );
}
