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
          className={`p-1 sm:p-1.5 rounded-lg border border-dashed flex flex-col items-center justify-center text-center min-h-[38px] sm:min-h-[42px] transition-all cursor-pointer ${
            isOver
              ? "border-amber-400 bg-amber-500/20 text-amber-200"
              : "border-[#4A3520]/70 bg-[#160E07]/40 text-[#8C7D6B] hover:border-amber-500/50 hover:bg-[#1E130A]"
          }`}
        >
          <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-300/80">
            <PlusCircle className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>{emptyLabel}</span>
          </div>
          {emptyDesc && (
            <p className="text-[7.5px] text-[#A89882] mt-0.5 truncate max-w-xs">
              {emptyDesc}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
