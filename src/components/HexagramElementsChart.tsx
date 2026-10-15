import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
} from "recharts";
import {
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Compass,
  ArrowRight,
  TrendingUp,
  Flame,
  Droplets,
  TreePine,
  Shield,
  Coins,
  Info,
} from "lucide-react";
import { Hexagram } from "../types";

export interface HexagramElementsChartProps {
  primaryHexagram: Hexagram;
  changingLines: number[];
  transformedHexagram?: Hexagram;
}

export type FiveElement = "Kim" | "Mộc" | "Thủy" | "Hỏa" | "Thổ";

export interface YaoElementInfo {
  line: number;
  name: string;
  isYang: boolean;
  trigramName: string;
  isUpper: boolean;
  branch: string;
  element: FiveElement;
  isChanging: boolean;
  transformedBranch?: string;
  transformedElement?: FiveElement;
  transformationRelation?: string;
  transformationNote?: string;
}

// Bảng Nạp Giáp Lục Hào chuẩn Kinh Phòng
const LOWER_NAP_GIAP: Record<string, { branch: string; element: FiveElement }[]> = {
  Càn: [
    { branch: "Tý", element: "Thủy" },
    { branch: "Dần", element: "Mộc" },
    { branch: "Thìn", element: "Thổ" },
  ],
  Khôn: [
    { branch: "Mùi", element: "Thổ" },
    { branch: "Tỵ", element: "Hỏa" },
    { branch: "Mão", element: "Mộc" },
  ],
  Chấn: [
    { branch: "Tý", element: "Thủy" },
    { branch: "Dần", element: "Mộc" },
    { branch: "Thìn", element: "Thổ" },
  ],
  Tốn: [
    { branch: "Sửu", element: "Thổ" },
    { branch: "Hợi", element: "Thủy" },
    { branch: "Dậu", element: "Kim" },
  ],
  Khảm: [
    { branch: "Dần", element: "Mộc" },
    { branch: "Thìn", element: "Thổ" },
    { branch: "Ngọ", element: "Hỏa" },
  ],
  Ly: [
    { branch: "Mão", element: "Mộc" },
    { branch: "Sửu", element: "Thổ" },
    { branch: "Hợi", element: "Thủy" },
  ],
  Cấn: [
    { branch: "Thìn", element: "Thổ" },
    { branch: "Ngọ", element: "Hỏa" },
    { branch: "Thân", element: "Kim" },
  ],
  Đoài: [
    { branch: "Tỵ", element: "Hỏa" },
    { branch: "Mão", element: "Mộc" },
    { branch: "Sửu", element: "Thổ" },
  ],
};

const UPPER_NAP_GIAP: Record<string, { branch: string; element: FiveElement }[]> = {
  Càn: [
    { branch: "Ngọ", element: "Hỏa" },
    { branch: "Thân", element: "Kim" },
    { branch: "Tuất", element: "Thổ" },
  ],
  Khôn: [
    { branch: "Sửu", element: "Thổ" },
    { branch: "Hợi", element: "Thủy" },
    { branch: "Dậu", element: "Kim" },
  ],
  Chấn: [
    { branch: "Ngọ", element: "Hỏa" },
    { branch: "Thân", element: "Kim" },
    { branch: "Tuất", element: "Thổ" },
  ],
  Tốn: [
    { branch: "Mùi", element: "Thổ" },
    { branch: "Tỵ", element: "Hỏa" },
    { branch: "Mão", element: "Mộc" },
  ],
  Khảm: [
    { branch: "Thân", element: "Kim" },
    { branch: "Tuất", element: "Thổ" },
    { branch: "Tý", element: "Thủy" },
  ],
  Ly: [
    { branch: "Dậu", element: "Kim" },
    { branch: "Mùi", element: "Thổ" },
    { branch: "Tỵ", element: "Hỏa" },
  ],
  Cấn: [
    { branch: "Tuất", element: "Thổ" },
    { branch: "Tý", element: "Thủy" },
    { branch: "Dần", element: "Mộc" },
  ],
  Đoài: [
    { branch: "Hợi", element: "Thủy" },
    { branch: "Dậu", element: "Kim" },
    { branch: "Mùi", element: "Thổ" },
  ],
};

export const ELEMENT_COLORS: Record<FiveElement, { main: string; light: string; bg: string; border: string }> = {
  Kim: { main: "#EAB308", light: "#FEF08A", bg: "#2E240D", border: "#854D0E" },
  Mộc: { main: "#10B981", light: "#A7F3D0", bg: "#06281E", border: "#047857" },
  Thủy: { main: "#3B82F6", light: "#BFDBFE", bg: "#0F213D", border: "#1D4ED8" },
  Hỏa: { main: "#EF4444", light: "#FECACA", bg: "#361314", border: "#B91C1C" },
  Thổ: { main: "#D97706", light: "#FDE68A", bg: "#311E0D", border: "#92400E" },
};

export const ELEMENT_ICONS: Record<FiveElement, React.ReactNode> = {
  Kim: <Coins className="w-3.5 h-3.5 text-yellow-400" />,
  Mộc: <TreePine className="w-3.5 h-3.5 text-emerald-400" />,
  Thủy: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  Hỏa: <Flame className="w-3.5 h-3.5 text-rose-400" />,
  Thổ: <Shield className="w-3.5 h-3.5 text-amber-500" />,
};

function getRelation(orig: FiveElement, trans: FiveElement): { rel: string; note: string } {
  if (orig === trans) {
    return { rel: "Tỷ Hòa", note: "Đồng khí tương cầu, củng cố năng lượng sẵn có" };
  }
  const generatingMap: Record<FiveElement, FiveElement> = {
    Kim: "Thủy",
    Thủy: "Mộc",
    Mộc: "Hỏa",
    Hỏa: "Thổ",
    Thổ: "Kim",
  };
  const overcomingMap: Record<FiveElement, FiveElement> = {
    Kim: "Mộc",
    Mộc: "Thổ",
    Thổ: "Thủy",
    Thủy: "Hỏa",
    Hỏa: "Kim",
  };

  if (generatingMap[trans] === orig) {
    return { rel: "Hồi Đầu Sinh", note: "Biến sinh Chủ: Đại cát, gốc rễ nhận được thêm sinh khí trợ lực" };
  }
  if (generatingMap[orig] === trans) {
    return { rel: "Tiết Khí", note: "Chủ sinh Biến: Năng lượng hào chủ tiêu hao để nuôi dưỡng hoàn cảnh mới" };
  }
  if (overcomingMap[trans] === orig) {
    return { rel: "Hồi Đầu Khắc", note: "Biến khắc Chủ: Cần thận trọng, gặp lực cản trở từ kết quả biến đổi" };
  }
  if (overcomingMap[orig] === trans) {
    return { rel: "Chế Khắc Biến", note: "Chủ khắc Biến: Bản thân nắm thế chủ động chế phục nghịch cảnh" };
  }

  return { rel: "Biến chuyển", note: "Năng lượng thay đổi trạng thái" };
}

export function computeYaoElements(
  primaryHex: Hexagram,
  changingLines: number[] = [],
  transformedHex?: Hexagram
): YaoElementInfo[] {
  const lowerList = LOWER_NAP_GIAP[primaryHex.lowerTrigram] || LOWER_NAP_GIAP["Càn"];
  const upperList = UPPER_NAP_GIAP[primaryHex.upperTrigram] || UPPER_NAP_GIAP["Càn"];

  const transLowerList = transformedHex ? (LOWER_NAP_GIAP[transformedHex.lowerTrigram] || LOWER_NAP_GIAP["Càn"]) : null;
  const transUpperList = transformedHex ? (UPPER_NAP_GIAP[transformedHex.upperTrigram] || UPPER_NAP_GIAP["Càn"]) : null;

  const result: YaoElementInfo[] = [];

  for (let lineNum = 1; lineNum <= 6; lineNum++) {
    const isUpper = lineNum >= 4;
    const trigramName = isUpper ? primaryHex.upperTrigram : primaryHex.lowerTrigram;
    const nap = isUpper ? upperList[lineNum - 4] : lowerList[lineNum - 1];
    const isYang = primaryHex.lines[lineNum - 1] === 1;
    const isChanging = changingLines.includes(lineNum);

    const lineNames = ["Sơ Hào", "Nhị Hào", "Tam Hào", "Tứ Hào", "Ngũ Hào", "Thượng Hào"];
    const yangYinName = isYang ? `Cửu ${lineNames[lineNum - 1]}` : `Lục ${lineNames[lineNum - 1]}`;

    let transBranch: string | undefined;
    let transElement: FiveElement | undefined;
    let transRel: string | undefined;
    let transNote: string | undefined;

    if (isChanging && transformedHex && transLowerList && transUpperList) {
      const tNap = isUpper ? transUpperList[lineNum - 4] : transLowerList[lineNum - 1];
      transBranch = tNap.branch;
      transElement = tNap.element;
      const { rel, note } = getRelation(nap.element, tNap.element);
      transRel = rel;
      transNote = note;
    }

    result.push({
      line: lineNum,
      name: `${lineNames[lineNum - 1]} (${yangYinName})`,
      isYang,
      trigramName,
      isUpper,
      branch: nap.branch,
      element: nap.element,
      isChanging,
      transformedBranch: transBranch,
      transformedElement: transElement,
      transformationRelation: transRel,
      transformationNote: transNote,
    });
  }

  return result;
}

export const HexagramElementsChart: React.FC<HexagramElementsChartProps> = ({
  primaryHexagram,
  changingLines,
  transformedHexagram,
}) => {
  const [chartType, setChartType] = useState<"bar" | "radar" | "pie">("bar");

  // Tính ngũ hành của 6 hào
  const yaoList = useMemo(() => {
    return computeYaoElements(primaryHexagram, changingLines, transformedHexagram);
  }, [primaryHexagram, changingLines, transformedHexagram]);

  // Thống kê phân bố theo 5 hành
  const elementsData = useMemo(() => {
    const countsPrimary: Record<FiveElement, number> = {
      Kim: 0,
      Mộc: 0,
      Thủy: 0,
      Hỏa: 0,
      Thổ: 0,
    };
    const countsTransformed: Record<FiveElement, number> = {
      Kim: 0,
      Mộc: 0,
      Thủy: 0,
      Hỏa: 0,
      Thổ: 0,
    };

    yaoList.forEach((y) => {
      countsPrimary[y.element] += 1;
      const targetElement = y.isChanging && y.transformedElement ? y.transformedElement : y.element;
      countsTransformed[targetElement] += 1;
    });

    const order: FiveElement[] = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];
    return order.map((elm) => ({
      element: elm,
      countPrimary: countsPrimary[elm],
      countTransformed: countsTransformed[elm],
      percentagePrimary: Math.round((countsPrimary[elm] / 6) * 100),
      percentageTransformed: Math.round((countsTransformed[elm] / 6) * 100),
      fill: ELEMENT_COLORS[elm].main,
    }));
  }, [yaoList]);

  // Tìm hành vượng nhất và hành suy/khuyết
  const { dominantElement, deficientElements } = useMemo(() => {
    let max = -1;
    let dominant: FiveElement = "Kim";
    const deficient: FiveElement[] = [];

    elementsData.forEach((item) => {
      if (item.countPrimary > max) {
        max = item.countPrimary;
        dominant = item.element as FiveElement;
      }
      if (item.countPrimary === 0) {
        deficient.push(item.element as FiveElement);
      }
    });

    return { dominantElement: dominant, deficientElements: deficient };
  }, [elementsData]);

  // Dữ liệu cho biểu đồ tròn
  const pieData = useMemo(() => {
    return elementsData
      .filter((d) => d.countPrimary > 0)
      .map((d) => ({
        name: d.element,
        value: d.countPrimary,
        fill: d.fill,
      }));
  }, [elementsData]);

  return (
    <div className="bg-gradient-to-br from-[#1C1610] via-[#16120E] to-[#0E0B08] border-2 border-[#523E26] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
      {/* Decorative top pattern */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFF0B8] to-[#997A24]" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#382A1B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#2B1D12] text-[#E5C378] font-mono text-xs font-bold border border-[#4E3722] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              KHO TÀNG DỊCH HỌC • NẠP GIÁP LỤC HÀO NGŨ HÀNH
            </span>
            <span className="text-[11px] font-mono text-[#A89882]">
              Quẻ #{primaryHexagram.number} {primaryHexagram.name} • Bản Thể {primaryHexagram.element}
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-serif font-black text-[#F8EED9] tracking-wide flex items-center gap-2">
            <span>ĐỒ THỊ PHÂN BỐ NGŨ HÀNH & QUAN SÁT VƯỢNG SUY</span>
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          </h3>
          <p className="text-xs text-[#B5A591] font-serif mt-1">
            Ứng dụng thuật Nạp Giáp Lục Hào (Kinh Phòng) phân định khí tiết Kim - Mộc - Thủy - Hỏa - Thổ của 6 hào và sự chuyển hóa khi có hào động.
          </p>
        </div>

        {/* Chart View Mode Switcher */}
        <div className="flex items-center bg-[#130F0C] border border-[#3E2E1D] rounded-xl p-1 text-xs font-serif shrink-0">
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === "bar"
                ? "bg-[#D4AF37] text-[#120F0C] font-bold shadow-md"
                : "text-[#A89882] hover:text-[#FFF]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Biểu Đồ Cột</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("radar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === "radar"
                ? "bg-[#D4AF37] text-[#120F0C] font-bold shadow-md"
                : "text-[#A89882] hover:text-[#FFF]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Đồ Thị Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === "pie"
                ? "bg-[#D4AF37] text-[#120F0C] font-bold shadow-md"
                : "text-[#A89882] hover:text-[#FFF]"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Tỉ Lệ Tròn</span>
          </button>
        </div>
      </div>

      {/* Main Charts & Vượng Suy Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Recharts Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-[#14100C] border border-[#3E2E1D] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-inner">
          <div className="flex items-center justify-between border-b border-[#2B1F14] pb-2 mb-3">
            <span className="text-xs font-serif font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              {chartType === "bar" && "Cán Cân Ngũ Hành: Quẻ Chủ" + (transformedHexagram ? " & Quẻ Biến" : "")}
              {chartType === "radar" && "Mạng Nhện Năng Lượng Ngũ Hành (Radar 5 Cực)"}
              {chartType === "pie" && "Cơ Cấu Tỉ Lệ % Ngũ Hành 6 Hào Quẻ Chủ"}
            </span>
            <span className="text-[10px] font-mono text-[#8C7A65]">Trục Lục Hào (6 Hào)</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={elementsData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B1F14" vertical={false} />
                  <XAxis dataKey="element" stroke="#C5B39B" tick={{ fontSize: 12, fill: "#E5D8C3", fontWeight: 600 }} />
                  <YAxis stroke="#C5B39B" domain={[0, 6]} ticks={[0, 1, 2, 3, 4, 5, 6]} tick={{ fontSize: 11, fill: "#8C7A65" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18130E",
                      border: "1px solid #523E26",
                      borderRadius: "10px",
                      color: "#F5EAD4",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    }}
                    cursor={{ fill: "rgba(212, 175, 55, 0.08)" }}
                    formatter={(value: any, name: any) => [
                      `${value} hào (${Math.round(((value as number) / 6) * 100)}%)`,
                      name === "countPrimary" ? `Quẻ Chủ #${primaryHexagram.number}` : `Quẻ Biến #${transformedHexagram?.number}`,
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 10, fontSize: "11px" }}
                    formatter={(val) => (
                      <span className="text-[#DDD0BD]">
                        {val === "countPrimary" ? `Quẻ Chủ (${primaryHexagram.name})` : `Quẻ Biến (${transformedHexagram?.name})`}
                      </span>
                    )}
                  />
                  <Bar dataKey="countPrimary" name="countPrimary" radius={[6, 6, 0, 0]}>
                    {elementsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  {transformedHexagram && (
                    <Bar
                      dataKey="countTransformed"
                      name="countTransformed"
                      fill="#9CA3AF"
                      stroke="#E5E7EB"
                      strokeDasharray="2 2"
                      radius={[6, 6, 0, 0]}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartType === "radar" && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={elementsData} outerRadius="75%">
                  <PolarGrid stroke="#3A2A1A" />
                  <PolarAngleAxis dataKey="element" stroke="#C5B39B" tick={{ fontSize: 12, fill: "#FFE8A3", fontWeight: 700 }} />
                  <PolarRadiusAxis domain={[0, 6]} stroke="#4A3520" tick={{ fill: "#8C7A65", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18130E",
                      border: "1px solid #523E26",
                      borderRadius: "10px",
                      color: "#F5EAD4",
                      fontSize: "12px",
                    }}
                  />
                  <Radar
                    name={`Quẻ Chủ (${primaryHexagram.name})`}
                    dataKey="countPrimary"
                    stroke="#D4AF37"
                    fill="#D4AF37"
                    fillOpacity={0.45}
                  />
                  {transformedHexagram && (
                    <Radar
                      name={`Quẻ Biến (${transformedHexagram.name})`}
                      dataKey="countTransformed"
                      stroke="#60A5FA"
                      fill="#3B82F6"
                      fillOpacity={0.25}
                    />
                  )}
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {chartType === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={38}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${Math.round((percent || 0) * 100)}%`}
                    labelLine={{ stroke: "#8C7A65", strokeWidth: 1 }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#1C1610" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18130E",
                      border: "1px solid #523E26",
                      borderRadius: "10px",
                      color: "#F5EAD4",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`${val} hào`, "Số lượng"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#251A10] flex items-center justify-between text-[11px] text-[#A6957E] flex-wrap gap-2">
            <span>
              💡 <em>Kim sinh Thủy ➔ Thủy sinh Mộc ➔ Mộc sinh Hỏa ➔ Hỏa sinh Thổ ➔ Thổ sinh Kim</em>
            </span>
            <span className="font-mono text-[#D4AF37] font-bold">
              Tổng số hào: 6 hào
            </span>
          </div>
        </div>

        {/* Right: Vượng Suy & Triết Lý Đánh Giá (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
          {/* Box 1: Vượng Suy Thống Kê */}
          <div className="bg-[#16120E] border border-[#3E2E1D] rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#2C2014] pb-2">
              <span className="text-xs font-serif font-bold text-[#E5C378] uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Đánh Giá Vượng — Suy — Khuyết
              </span>
              <span className="text-[10px] font-mono text-[#9E8B75]">Phong Thủy Học</span>
            </div>

            {/* Hành Vượng Nhất */}
            <div className="p-3 rounded-lg bg-[#22180F] border border-[#4D361F] flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider block">
                  👑 HÀNH VƯỢNG NHẤT (CHỦ VƯỢNG):
                </span>
                <div className="text-sm font-serif font-black text-[#FFE8A3] flex items-center gap-1.5">
                  {ELEMENT_ICONS[dominantElement]}
                  <span>Hành {dominantElement}</span>
                  <span className="text-xs font-mono font-normal text-[#C5B39B]">
                    ({elementsData.find((d) => d.element === dominantElement)?.countPrimary}/6 hào • {elementsData.find((d) => d.element === dominantElement)?.percentagePrimary}%)
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#140F0A] text-[#FFE8A3] border border-[#583E20]">
                Thế Khí Thịnh
              </span>
            </div>

            {/* Hành Khuyết / Suy */}
            <div className="p-3 rounded-lg bg-[#18130E] border border-[#3A2A1A] flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#A89882] uppercase font-bold tracking-wider block">
                  ⚠️ HÀNH KHUYẾT (THIẾU HỤT):
                </span>
                <div className="text-xs sm:text-sm font-serif text-[#DDD0BD]">
                  {deficientElements.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {deficientElements.map((def) => (
                        <span key={def} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#251A12] border border-[#4A321E] text-[#F3E5AB]">
                          {ELEMENT_ICONS[def]}
                          <span>{def}</span>
                          <span className="text-[10px] text-rose-400 font-mono">(0 hào)</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-medium">Ngũ hành đầy đủ, không bị khuyết hành nào.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Ngũ Hành Bản Mệnh Toàn Quẻ */}
            <div className="p-2.5 rounded-lg bg-[#140F0A] border border-[#2B1F14] text-xs font-serif text-[#CBB99E] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase">Ngũ hành Quẻ Chủ:</span>
                <strong className="text-[#FFE294]">{primaryHexagram.element}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8C7A65]">Thượng Quái ({primaryHexagram.upperTrigram}):</span>
                <span>{LOWER_NAP_GIAP[primaryHexagram.upperTrigram]?.[0]?.element || "Kim"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8C7A65]">Hạ Quái ({primaryHexagram.lowerTrigram}):</span>
                <span>{LOWER_NAP_GIAP[primaryHexagram.lowerTrigram]?.[0]?.element || "Kim"}</span>
              </div>
            </div>
          </div>

          {/* Box 2: Lời khuyên điều hòa Ngũ Hành */}
          <div className="bg-[#16120E] border border-[#3E2E1D] rounded-xl p-4 space-y-2 shadow-md">
            <div className="text-xs font-serif font-bold text-[#E5C378] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ý Nghĩa Điều Hòa Vận Khí</span>
            </div>
            <p className="text-xs font-serif text-[#EDE0CC] leading-relaxed">
              {deficientElements.length > 0
                ? `Quẻ này hành ${dominantElement} nắm quyền chủ vận, khuyết thiếu hành ${deficientElements.join(", ")}. Khi hành sự nên bổ trợ thêm các yếu tố thuộc hành khuyết (màu sắc, tính cách điềm đạm, môi trường thích hợp) để cân bằng sinh khắc, tránh cực đoan thái quá.`
                : `Ngũ hành trong quẻ tương đối hài hòa, hành ${dominantElement} vượng phát mang lại khí thế chủ động mạnh mẽ. Hãy thuận theo thế tương sinh để mọi dự định diễn ra hanh thông.`}
            </p>
          </div>
        </div>
      </div>

      {/* Chi Tiết Lục Hào Nạp Giáp (Bảng 6 Hào Thực Tế) */}
      <div className="bg-[#14100C] border border-[#3E2E1D] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-inner">
        <div className="flex items-center justify-between border-b border-[#2C2014] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F8EED9] uppercase tracking-wide">
              Bảng Phân Tích Lục Hào Nạp Giáp (Từ Sơ Hào Lên Thượng Hào)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#A89882]">
            {changingLines.length > 0 ? `Có ${changingLines.length} hào động biến chuyển` : "Quẻ Tĩnh không có hào động"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {yaoList.map((y) => {
            const colors = ELEMENT_COLORS[y.element];
            return (
              <div
                key={y.line}
                className={`p-3 rounded-xl border transition-all text-xs font-serif space-y-2 relative overflow-hidden ${
                  y.isChanging
                    ? "bg-gradient-to-br from-[#26170E] to-[#18110A] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-md"
                    : "bg-[#18130E] border-[#342617] hover:border-[#4E3923]"
                }`}
              >
                {/* Header Hào */}
                <div className="flex items-center justify-between border-b border-[#2B1F14] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                        y.isYang ? "bg-amber-950 text-amber-300 border border-amber-600/60" : "bg-slate-900 text-slate-300 border border-slate-600/60"
                      }`}
                    >
                      {y.line}
                    </span>
                    <span className="font-bold text-[#F3E5AB]">{y.name}</span>
                  </div>
                  {y.isChanging && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-[#D4AF37] text-black">
                      Động Biến
                    </span>
                  )}
                </div>

                {/* Chi Tiết Ngũ Hành & Can Chi */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#8C7A65]">Địa Chi & Ngũ Hành:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="font-mono text-[#DDD0BE]">{y.branch}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.light,
                        borderColor: colors.border,
                      }}
                    >
                      {ELEMENT_ICONS[y.element]}
                      <span>{y.element}</span>
                    </span>
                  </div>
                </div>

                {/* Nếu Hào Động ➔ Hiển thị kết quả hào biến */}
                {y.isChanging && y.transformedElement && y.transformedBranch && (
                  <div className="mt-2 pt-1.5 border-t border-[#3E2A18] text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#D4AF37] flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                        <span>Biến thành:</span>
                      </span>
                      <div className="flex items-center gap-1 font-bold">
                        <span className="font-mono text-[#DDD0BE]">{y.transformedBranch}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] border flex items-center gap-0.5"
                          style={{
                            backgroundColor: ELEMENT_COLORS[y.transformedElement].bg,
                            color: ELEMENT_COLORS[y.transformedElement].light,
                            borderColor: ELEMENT_COLORS[y.transformedElement].border,
                          }}
                        >
                          {ELEMENT_ICONS[y.transformedElement]}
                          <span>{y.transformedElement}</span>
                        </span>
                      </div>
                    </div>
                    {y.transformationRelation && (
                      <div className="text-[10px] text-[#EAD8B1] bg-[#120E0A] p-1.5 rounded border border-[#3E2E1D] leading-tight">
                        <strong className="text-[#D4AF37]">{y.transformationRelation}:</strong> {y.transformationNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
