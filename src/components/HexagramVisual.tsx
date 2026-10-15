import React from "react";
import { Hexagram } from "../types";

interface HexagramVisualProps {
  hexagram: Hexagram;
  changingLines?: number[]; // 1 to 6
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export const HexagramVisual: React.FC<HexagramVisualProps> = ({
  hexagram,
  changingLines = [],
  size = "md",
  showLabels = true,
}) => {
  // Height and width based on size
  const heightClass = size === "sm" ? "h-20 w-28" : size === "lg" ? "h-44 w-56" : "h-32 w-40";
  const lineThickness = size === "sm" ? "h-2" : size === "lg" ? "h-4" : "h-3";
  const gapClass = size === "sm" ? "gap-1.5" : size === "lg" ? "gap-2.5" : "gap-2";

  // Lines are arranged bottom-to-top: line 1 (bottom) to line 6 (top)
  // When rendering in flex-col, we render line 6 on top down to line 1 at bottom.
  const linesToRender = [5, 4, 3, 2, 1, 0];

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#1C1A17] to-[#141311] border border-[#3A332A] rounded-xl shadow-inner">
      <div className={`flex flex-col justify-between ${heightClass} ${gapClass}`}>
        {linesToRender.map((idx) => {
          const lineNumber = idx + 1; // 1-indexed
          const isYang = hexagram.lines[idx] === 1;
          const isChanging = changingLines.includes(lineNumber);

          return (
            <div key={lineNumber} className="relative flex items-center justify-between w-full group">
              {/* Left label if enabled */}
              {showLabels && size !== "sm" && (
                <span className="absolute -left-7 text-[10px] font-mono text-[#8C8273] select-none">
                  {lineNumber === 1
                    ? "Sơ"
                    : lineNumber === 6
                    ? "Thượng"
                    : `H${lineNumber}`}
                </span>
              )}

              {/* The Line Representation */}
              {isYang ? (
                // Dương hào: Vạch liền
                <div
                  className={`w-full ${lineThickness} rounded-sm transition-all duration-300 ${
                    isChanging
                      ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_14px_#ef4444] animate-pulse ring-1 ring-red-400"
                      : "bg-gradient-to-r from-[#C89B3C] via-[#E2C37A] to-[#C89B3C] shadow-sm"
                  }`}
                />
              ) : (
                // Âm hào: Vạch đứt (2 đoạn)
                <div className={`flex justify-between w-full ${lineThickness}`}>
                  <div
                    className={`w-[44%] h-full rounded-sm transition-all duration-300 ${
                      isChanging
                        ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_14px_#ef4444] animate-pulse ring-1 ring-red-400"
                        : "bg-gradient-to-r from-[#8C7A63] to-[#B09F85]"
                    }`}
                  />
                  <div
                    className={`w-[44%] h-full rounded-sm transition-all duration-300 ${
                      isChanging
                        ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_14px_#ef4444] animate-pulse ring-1 ring-red-400"
                        : "bg-gradient-to-r from-[#B09F85] to-[#8C7A63]"
                    }`}
                  />
                </div>
              )}

              {/* Changing marker on the right */}
              {isChanging && (
                <span className="absolute -right-6 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-yellow-300 bg-red-600 border border-red-400 rounded-full shadow-[0_0_8px_#ef4444] animate-pulse">
                  ●
                </span>
              )}
            </div>
          );
        })}
      </div>

      {showLabels && (
        <div className="mt-3 flex items-center justify-between w-full px-1 text-[11px] text-[#A69986] border-t border-[#2F2922] pt-2">
          <div className="flex items-center gap-1">
            <span className="text-[#8C8273]">Thượng:</span>
            <span className="font-semibold text-[#E6DCBF]">{hexagram.upperTrigram}</span>
          </div>
          <div className="text-sm font-serif font-bold text-[#D4AF37]">{hexagram.symbol}</div>
          <div className="flex items-center gap-1">
            <span className="text-[#8C8273]">Hạ:</span>
            <span className="font-semibold text-[#E6DCBF]">{hexagram.lowerTrigram}</span>
          </div>
        </div>
      )}
    </div>
  );
};
