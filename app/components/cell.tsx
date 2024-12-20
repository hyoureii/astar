import React from "react";

export default function cell({
    value,
    position,
    onClick,
    isStart,
    isEnd,
    isPath,
}: {
    value: number;
    position: [number, number];
    onClick: (i: number, j: number) => void;
    isStart: boolean;
    isEnd: boolean;
    isPath: boolean;
}) {
    const getCellColor = () => {
        if (isStart) {
            return "bg-green-500";
        }
        if (isEnd) {
            return "bg-red-500";
        }
        if (isPath) {
            return "bg-blue-500";
        }
        return value === 0 ? "bg-gray-300" : "bg-primary";
    };

    return (
        <div
            className={`w-8 h-8 cursor-pointer rounded-sm ${getCellColor()} transition-colors duration-200`}
            onClick={() => onClick(position[0], position[1])}
        />
    );
}
