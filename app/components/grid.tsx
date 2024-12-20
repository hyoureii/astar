"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import Cell from "@/app/components/cell";

type Node = {
    f: number;
    g: number;
    h: number;
    position: [number, number];
    parent: Node | null;
};

type Position = [number, number];

const getDistance = (pos1: Position, pos2: Position): number => {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
};

const getNeighbors = (
    position: Position,
    grid: number[][],
    visited: Set<string>
): Position[] => {
    const [row, col] = position;
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    return directions
        .map(([dx, dy]) => [row + dx, col + dy] as Position)
        .filter(
            ([newRow, newCol]) =>
                newRow >= 0 &&
                newRow < grid.length &&
                newCol >= 0 &&
                newCol < grid[0].length &&
                grid[newRow][newCol] === 0 &&
                !visited.has(`${newRow},${newCol}`)
        );
};

const reconstructPath = (endNode: Node): Position[] => {
    const path: Position[] = [];
    let current: Node | null = endNode;

    while (current !== null) {
        path.unshift(current.position);
        current = current.parent;
    }

    return path;
};

export const findIterative = (
    grid: number[][],
    start: Position,
    end: Position
): Position[] | null => {
    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    // Create the start node
    const startNode: Node = {
        position: start,
        g: 0,
        h: getDistance(start, end),
        f: getDistance(start, end),
        parent: null,
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
        // Find the node with the lowest f score
        const currentIndex = openSet.reduce(
            (lowest, node, index) =>
                node.f < openSet[lowest].f ? index : lowest,
            0
        );
        const current = openSet[currentIndex];

        // If we've reached the end, reconstruct and return the path
        if (current.position[0] === end[0] && current.position[1] === end[1]) {
            return reconstructPath(current);
        }

        // Remove current from openSet and add to closedSet
        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.position[0]},${current.position[1]}`);

        // Check all neighbors
        const neighbors = getNeighbors(current.position, grid, closedSet);

        for (const neighbor of neighbors) {
            const gScore = current.g + 1; // Cost to move to neighbor

            // Create neighbor node
            const neighborNode: Node = {
                position: neighbor,
                g: gScore,
                h: getDistance(neighbor, end),
                f: gScore + getDistance(neighbor, end),
                parent: current,
            };

            // Check if this is a better path
            const existingOpenNode = openSet.find(
                (node) =>
                    node.position[0] === neighbor[0] &&
                    node.position[1] === neighbor[1]
            );

            if (existingOpenNode) {
                if (gScore < existingOpenNode.g) {
                    // Update existing node
                    existingOpenNode.g = gScore;
                    existingOpenNode.f = gScore + existingOpenNode.h;
                    existingOpenNode.parent = current;
                }
            } else {
                openSet.push(neighborNode);
            }
        }
    }

    // No path found
    return null;
};

const aStarRecursive = (
    grid: number[][],
    openSet: Node[],
    closedSet: Set<string>,
    end: Position
): Node | null => {
    // Base case: if openSet is empty, no path exists
    if (openSet.length === 0) {
        return null;
    }

    // Find the node with lowest f score
    const currentIndex = openSet.reduce(
        (lowest, node, index) => (node.f < openSet[lowest].f ? index : lowest),
        0
    );
    const current = openSet[currentIndex];

    // If we've reached the end, return the current node
    if (current.position[0] === end[0] && current.position[1] === end[1]) {
        return current;
    }

    // Remove current from openSet and add to closedSet
    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.position[0]},${current.position[1]}`);

    // Get and process neighbors
    const neighbors = getNeighbors(current.position, grid, closedSet);

    for (const neighbor of neighbors) {
        const gScore = current.g + 1;

        const neighborNode: Node = {
            position: neighbor,
            g: gScore,
            h: getDistance(neighbor, end),
            f: gScore + getDistance(neighbor, end),
            parent: current,
        };

        const existingOpenNode = openSet.find(
            (node) =>
                node.position[0] === neighbor[0] &&
                node.position[1] === neighbor[1]
        );

        if (existingOpenNode) {
            if (gScore < existingOpenNode.g) {
                existingOpenNode.g = gScore;
                existingOpenNode.f = gScore + existingOpenNode.h;
                existingOpenNode.parent = current;
            }
        } else {
            openSet.push(neighborNode);
        }
    }

    // Recursive call with updated openSet and closedSet
    return aStarRecursive(grid, openSet, closedSet, end);
};

export const findPath = (
    grid: number[][],
    start: Position,
    end: Position
): Position[] | null => {
    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    // Create the start node
    const startNode: Node = {
        position: start,
        g: 0,
        h: getDistance(start, end),
        f: getDistance(start, end),
        parent: null,
    };

    openSet.push(startNode);

    // Start the recursive search
    const finalNode = aStarRecursive(grid, openSet, closedSet, end);

    if (finalNode) {
        return reconstructPath(finalNode);
    }

    return null;
};

export default function Grid() {
    const [grid, setGrid] = useState<number[][]>([]);
    const [start, setStart] = useState<[number, number] | null>(null);
    const [end, setEnd] = useState<[number, number] | null>(null);
    const [width, setWidth] = useState<number>(40);
    const [height, setHeight] = useState<number>(20);
    const [ratio, setRatio] = useState<number>(70);
    const [path, setPath] = useState<Position[]>([]);

    const handleFindIterative = () => {
        if (!start || !end) return;

        const foundPath = findIterative(grid, start, end);
        if (foundPath) {
            setPath(foundPath);
        } else {
            // Handle no path found
            setPath([]);
            alert("No valid path found!");
        }
    };

    const handleFindRecursive = () => {
        if (!start || !end) return;

        const foundPath = findPath(grid, start, end);
        if (foundPath) {
            setPath(foundPath);
        } else {
            setPath([]);
            alert("No valid path found!");
        }
    };

    const isPoint = (
        point: [number, number] | null,
        i: number,
        j: number
    ): boolean => {
        return point !== null && point[0] === i && point[1] === j;
    };

    useEffect(() => {
        const initializeGrid = (width: number, height: number): number[][] => {
            return Array(height)
                .fill(1)
                .map(() =>
                    Array(width)
                        .fill(1)
                        .map(() => (Math.random() < ratio / 100 ? 0 : 1))
                );
        };

        setGrid(initializeGrid(width, height));
        setStart(null);
        setEnd(null);
        setPath([]);
    }, [width, height, ratio]);

    useEffect(() => {}, [start, end]);

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value <= 50) {
            setWidth(value);
        }
    };
    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            setHeight(value);
        }
    };
    const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value <= 100) {
            setRatio(value);
        }
    };
    const handleCellClick = (i: number, j: number): void => {
        if (!start) {
            setStart([i, j]);
        } else if (!end && (i !== start[0] || j !== start[1])) {
            setEnd([i, j]);
        } else if (start && i === start[0] && j === start[1]) {
            setStart(null);
            setEnd(null);
        } else if (end && i === end[0] && j === end[1]) {
            setEnd(null);
        }
        setPath([]);
    };
    const isInPath = (i: number, j: number): boolean => {
        return path.some(([row, col]) => row === i && col === j);
    };

    return (
        <div className="p-4 max-w-full mx-auto">
            <div className="mb-4 flex space-x-2 justify-center items-end">
                <div>
                    <label
                        htmlFor="width-input"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Grid Width
                    </label>
                    <Input
                        id="width-input"
                        type="number"
                        value={width}
                        onChange={handleWidthChange}
                        min="1"
                        className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label
                        htmlFor="height-input"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Grid Height
                    </label>
                    <Input
                        id="height-input"
                        type="number"
                        value={height}
                        onChange={handleHeightChange}
                        min="1"
                        className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label
                        htmlFor="height-input"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Grid Ratio (%)
                    </label>
                    <Input
                        id="ratio-input"
                        type="number"
                        value={ratio}
                        onChange={handleRatioChange}
                        min="1"
                        className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="flex justify-center">
                    <Button
                        onClick={handleFindIterative}
                        disabled={!start || !end}
                        className="px-4 py-2"
                    >
                        Iterative
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Button
                        onClick={handleFindRecursive}
                        disabled={!start || !end}
                        className="px-4 py-2"
                    >
                        Recursive
                    </Button>
                </div>
            </div>

            <div className="mt-8 max-w-full">
                <div className="p-2 rounded-md flex flex-col justify-center items-center gap-1 border-2 border-gray-400">
                    {grid.map((row, i) => (
                        <div key={i} className="flex gap-1">
                            {row.map((cell, j) => (
                                <Cell
                                    key={`${i}-${j}`}
                                    value={cell}
                                    position={[i, j]}
                                    onClick={handleCellClick}
                                    isStart={isPoint(start, i, j)}
                                    isEnd={isPoint(end, i, j)}
                                    isPath={isInPath(i, j)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
