"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import Cell from "@/app/components/cell";

interface GridProps {
      onPathFound?: (info: {
            success: boolean;
            executionTime: number;
            type: "Iterative" | "Recursive";
      }) => void;
}

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

const findIterative = async (
      grid: number[][],
      start: Position,
      end: Position,
      setVisited: (pos: Position) => void
): Promise<Position[] | null> => {
      const openSet: Node[] = [];
      const closedSet = new Set<string>();

      const startNode: Node = {
            position: start,
            g: 0,
            h: getDistance(start, end),
            f: getDistance(start, end),
            parent: null,
      };

      openSet.push(startNode);

      while (openSet.length > 0) {
            const currentIndex = openSet.reduce(
                  (lowest, node, index) =>
                        node.f < openSet[lowest].f ? index : lowest,
                  0
            );
            const current = openSet[currentIndex];

            if (
                  current.position[0] === end[0] &&
                  current.position[1] === end[1]
            ) {
                  return reconstructPath(current);
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.position[0]},${current.position[1]}`);
            setVisited(current.position);
            await new Promise((resolve) => setTimeout(resolve, 0));

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
      }

      return null;
};

const findRecursive = async (
      grid: number[][],
      start: Position,
      end: Position,
      setVisited: (pos: Position) => void
): Promise<Position[] | null> => {
      const openSet: Node[] = [];
      const closedSet = new Set<string>();

      const startNode: Node = {
            position: start,
            g: 0,
            h: getDistance(start, end),
            f: getDistance(start, end),
            parent: null,
      };

      openSet.push(startNode);

      const checkNeighbors = async (
            neighbors: Position[],
            current: Node,
            index: number = 0
      ): Promise<void> => {
            if (index >= neighbors.length) {
                  return;
            }

            const neighbor = neighbors[index];
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

            // Recursive call for next neighbor
            await checkNeighbors(neighbors, current, index + 1);
      };

      const processNode = async (): Promise<Node | null> => {
            if (openSet.length === 0) {
                  return null;
            }

            const currentIndex = openSet.reduce(
                  (lowest, node, index) =>
                        node.f < openSet[lowest].f ? index : lowest,
                  0
            );
            const current = openSet[currentIndex];

            if (
                  current.position[0] === end[0] &&
                  current.position[1] === end[1]
            ) {
                  return current;
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.position[0]},${current.position[1]}`);
            setVisited(current.position);

            await new Promise((resolve) => setTimeout(resolve, 0));

            const neighbors = getNeighbors(current.position, grid, closedSet);
            await checkNeighbors(neighbors, current);

            return processNode();
      };

      const finalNode = await processNode();
      if (finalNode) {
            return reconstructPath(finalNode);
      }

      return null;
};

export default function Grid({ onPathFound }: GridProps) {
      const [grid, setGrid] = useState<number[][]>([]);
      const [start, setStart] = useState<[number, number] | null>(null);
      const [end, setEnd] = useState<[number, number] | null>(null);
      const [width, setWidth] = useState<number>(40);
      const [height, setHeight] = useState<number>(20);
      const [ratio, setRatio] = useState<number>(70);
      const [path, setPath] = useState<Position[]>([]);
      const [visited, setVisited] = useState<Set<string>>(new Set());
      const [isLoading, setIsLoading] = useState<boolean>(false);

      const addVisited = (pos: Position) => {
            setVisited((prev) => new Set(prev).add(`${pos[0]},${pos[1]}`));
      };

      const handleFindIterative = async () => {
            if (!start || !end) return;
            setVisited(new Set());
            setPath([]);
            setIsLoading(true);

            const startTime = performance.now();

            const foundPath = await findIterative(grid, start, end, addVisited);
            const endTime = performance.now();
            const runningTime = endTime - startTime;

            if (foundPath) {
                  setPath(foundPath);
                  onPathFound?.({
                        success: true,
                        executionTime: runningTime,
                        type: "Iterative",
                  });
            } else {
                  setPath([]);
                  onPathFound?.({
                        success: false,
                        executionTime: runningTime,
                        type: "Iterative",
                  });
            }
            setIsLoading(false);
      };

      const handleFindRecursive = async () => {
            if (!start || !end) return;
            setVisited(new Set());
            setPath([]);
            setIsLoading(true);

            const startTime = performance.now();

            const foundPath = await findRecursive(grid, start, end, addVisited);
            const endTime = performance.now();
            const runningTime = endTime - startTime;

            if (foundPath) {
                  setPath(foundPath);
                  onPathFound?.({
                        success: true,
                        executionTime: runningTime,
                        type: "Recursive",
                  });
            } else {
                  setPath([]);
                  onPathFound?.({
                        success: false,
                        executionTime: runningTime,
                        type: "Recursive",
                  });
            }
            setIsLoading(false);
      };

      const isPoint = (
            point: [number, number] | null,
            i: number,
            j: number
      ): boolean => {
            return point !== null && point[0] === i && point[1] === j;
      };

      const initializeGrid = (width: number, height: number): number[][] => {
            return Array(height)
                  .fill(1)
                  .map(() =>
                        Array(width)
                              .fill(1)
                              .map(() => (Math.random() < ratio / 100 ? 0 : 1))
                  );
      };

      const generateGrid = () => {
            setGrid(initializeGrid(width, height));
            setStart(null);
            setEnd(null);
            setPath([]);
            setVisited(new Set());
      };

      useEffect(() => {
            generateGrid();
      }, [width, height, ratio]);

      const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value <= 50) {
                  setWidth(value);
            }
      };
      const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value <= 100) {
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
            setVisited(new Set());
      };
      const isInPath = (i: number, j: number): boolean => {
            return path.some(([row, col]) => row === i && col === j);
      };
      const isVisited = (i: number, j: number): boolean => {
            return visited.has(`${i},${j}`);
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
                                    disabled={!start || !end || isLoading}
                                    className="px-4 py-2"
                              >
                                    Iterative
                              </Button>
                        </div>
                        <div className="flex justify-center">
                              <Button
                                    onClick={handleFindRecursive}
                                    disabled={!start || !end || isLoading}
                                    className="px-4 py-2"
                              >
                                    Recursive
                              </Button>
                        </div>
                        <div className="flex justify-center">
                              <Button
                                    onClick={generateGrid}
                                    className="px-4 py-2"
                                    disabled={isLoading}
                              >
                                    Regenerate Grid
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
                                                      isStart={isPoint(
                                                            start,
                                                            i,
                                                            j
                                                      )}
                                                      isEnd={isPoint(end, i, j)}
                                                      isPath={isInPath(i, j)}
                                                      isVisited={isVisited(
                                                            i,
                                                            j
                                                      )}
                                                />
                                          ))}
                                    </div>
                              ))}
                        </div>
                  </div>
            </div>
      );
}
