import React from "react";
import { PlusCircle } from "lucide-react";
import { TwoTierZone, TWO_TIER_ZONE_CONFIG } from "./BaziTwoTierCard";

interface BaziTwoTierDropZoneProps {
  zoneKey: TwoTierZone;
  activeDropZone: TwoTierZone | null;
  onDropToZone: (pillarKey: string, zone: TwoTierZone) => void;
  onDragOverZone: (zone: TwoTierZone) => void;
  onDragLeaveZone: () => void;
  itemCount: number;
  children: React.ReactNode;
  emptyLabel?: string;
  emptyDesc?: string;
  className?: string;
}

export const BaziTwoTierDropZone: React.FC<BaziTwoTierDropZoneProps> = ({
  zoneKey,
  activeDropZone,
  onDropToZone,
  onDragOverZone,
  onDragLeaveZone,
  itemCount,
  children,
  emptyLabel = "Kéo thả Địa Chi vào đây",
  emptyDesc,
  className = "",
}) => {
  const isOver = activeDropZone === zoneKey;
  const config = TWO_TIER_ZONE_CONFIG.find((z) => z.key === zoneKey);

  return (
    <div
      data-zone-key={zoneKey}
      id={`dropzone-${zoneKey}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOverZone(zoneKey);
      }}
      onDragLeave={(e) => {
        // Only trigger if leaving the container itself
        if (e.currentTarget === e.target) {
          onDragLeaveZone();
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        const key = e.dataTransfer.getData("text/plain");
        if (key) {
          onDropToZone(key, zoneKey);
        }
        onDragLeaveZone();
      }}
      className={`rounded-xl transition-all duration-200 ${
        isOver
          ? "ring-2 ring-amber-400 bg-amber-500/15 border-2 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.01]"
          : ""
      } ${className}`}
    >
      {itemCount > 0 ? (
        children
      ) : (
        <div
          className={`p-1.5 sm:p-2 rounded-lg border border-dashed flex flex-col items-center justify-center text-center min-h-[42px] sm:min-h-[48px] transition-all cursor-pointer ${
            isOver
              ? "border-[#C4963E] bg-[#FAF0D7] text-[#78350F]"
              : "border-[#D8C8A8] bg-[#FAF6EE]/60 text-[#6E5D47] hover:border-[#C4963E] hover:bg-[#FAF6EE]"
          }`}
        >
          <div className="flex items-center gap-1 text-[9.5px] font-semibold text-[#78350F]">
            <PlusCircle className="w-2.5 h-2.5 text-[#92400E] shrink-0" />
            <span>{emptyLabel}</span>
          </div>
          {emptyDesc && (
            <p className="text-[8px] text-[#5C4D3C] mt-0.5 truncate max-w-xs">
              {emptyDesc}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
