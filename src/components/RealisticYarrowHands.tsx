import React from "react";
import { motion } from "motion/react";

/**
 * Realistic Taoist Master Hands & Yarrow Stalks SVGs
 * Designed with authentic anatomical proportions, graceful classical mudras,
 * traditional cinnabar silk robes with gold cloud embroidery, jade ring,
 * and 3D textured yarrow stalks with bamboo nodes and realistic picking gestures.
 */

// ============================================================================
// 1. REALISTIC YARROW STALK COMPONENT (Single / Bundle with nodes & lighting)
// ============================================================================
interface YarrowStalkProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  glow?: boolean;
  active?: boolean;
  accentColor?: string;
  className?: string;
}

export const RealisticYarrowStalk: React.FC<YarrowStalkProps> = ({
  x = 0,
  y = 0,
  width = 6,
  height = 90,
  rotation = 0,
  glow = false,
  active = false,
  accentColor,
  className = "",
}) => {
  const stalkId = React.useId().replace(/:/g, "_");

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      className={`transition-all duration-300 ${className}`}
    >
      <defs>
        {/* Longitudinal cylindrical gradient for bamboo/yarrow rod */}
        <linearGradient id={`yarrow_grad_${stalkId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8C5C1E" />
          <stop offset="25%" stopColor="#DFB25A" />
          <stop offset="50%" stopColor="#FFF2B8" />
          <stop offset="75%" stopColor="#D4A144" />
          <stop offset="100%" stopColor="#6E4413" />
        </linearGradient>

        {/* Glow filter if active or suspended */}
        {glow && (
          <filter id={`stalk_glow_${stalkId}`} x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.9" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Drop shadow on mat */}
      <rect
        x={-width / 2 + 3}
        y={4}
        width={width}
        height={height}
        rx={width / 2}
        fill="rgba(10, 6, 2, 0.55)"
        filter="blur(2px)"
      />

      {/* Main stalk body */}
      <rect
        x={-width / 2}
        y={0}
        width={width}
        height={height}
        rx={width / 2.2}
        fill={`url(#yarrow_grad_${stalkId})`}
        stroke={active ? "#FFE57F" : "#5A380E"}
        strokeWidth={active ? 1.2 : 0.6}
        filter={glow ? `url(#stalk_glow_${stalkId})` : undefined}
      />

      {/* Bamboo/reed nodes (mắt gióng) at 25%, 55%, 82% */}
      {/* Node 1 */}
      <g transform={`translate(0, ${height * 0.25})`}>
        <ellipse cx={0} cy={0} rx={width / 2 + 0.6} ry={1.2} fill="#54330B" />
        <ellipse cx={0} cy={-0.6} rx={width / 2 + 0.4} ry={0.8} fill="#FFEAA0" opacity={0.7} />
      </g>

      {/* Node 2 */}
      <g transform={`translate(0, ${height * 0.58})`}>
        <ellipse cx={0} cy={0} rx={width / 2 + 0.6} ry={1.2} fill="#54330B" />
        <ellipse cx={0} cy={-0.6} rx={width / 2 + 0.4} ry={0.8} fill="#FFEAA0" opacity={0.7} />
      </g>

      {/* Node 3 */}
      <g transform={`translate(0, ${height * 0.84})`}>
        <ellipse cx={0} cy={0} rx={width / 2 + 0.6} ry={1.2} fill="#54330B" />
        <ellipse cx={0} cy={-0.6} rx={width / 2 + 0.4} ry={0.8} fill="#FFEAA0" opacity={0.7} />
      </g>

      {/* Top and bottom end caps */}
      <ellipse cx={0} cy={1} rx={width / 2 - 0.5} ry={1} fill="#FFF6D1" opacity={0.9} />
      <ellipse cx={0} cy={height - 1} rx={width / 2 - 0.5} ry={1} fill="#5A380E" />

      {/* Optional accent tip indicator */}
      {accentColor && (
        <circle cx={0} cy={3} r={1.5} fill={accentColor} />
      )}
    </g>
  );
};

// ============================================================================
// 2. REALISTIC LEFT HAND (Bàn Tay Trái Đạo Sĩ - Giữ Bó & Kẹp Kẽ Ngón)
// ============================================================================
interface RealisticLeftHandProps {
  crevice1Stalks?: number; // Quải nhất (1 stalk between Ring & Pinky)
  crevice2Stalks?: number; // Remainder Left (between Middle & Ring)
  crevice3Stalks?: number; // Remainder Right (between Index & Middle)
  heldBundleCount?: number; // Stalks resting in palm
  isClamping?: boolean; // Little finger clamping tightly
  highlightCrevices?: boolean;
}

export const RealisticLeftHandSvg: React.FC<RealisticLeftHandProps> = ({
  crevice1Stalks = 0,
  crevice2Stalks = 0,
  crevice3Stalks = 0,
  heldBundleCount = 0,
  isClamping = true,
  highlightCrevices = false,
}) => {
  return (
    <svg
      viewBox="0 0 240 260"
      className="w-full h-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] overflow-visible"
    >
      <defs>
        {/* Comprehensive Natural Skin Gradients */}
        <linearGradient id="skin_base_lh" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#FFF7F0" />
          <stop offset="25%" stopColor="#FDE3CE" />
          <stop offset="50%" stopColor="#F5C4A0" />
          <stop offset="75%" stopColor="#DE9A6F" />
          <stop offset="92%" stopColor="#B3653A" />
          <stop offset="100%" stopColor="#7E3A19" />
        </linearGradient>

        <linearGradient id="skin_shadow_lh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A85E33" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#54240B" stopOpacity="0.95" />
        </linearGradient>

        {/* 3D Cylindrical lighting for fingers */}
        <linearGradient id="finger_cyl_lh" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C97E4E" />
          <stop offset="20%" stopColor="#FDE3D0" />
          <stop offset="45%" stopColor="#FFF5ED" />
          <stop offset="70%" stopColor="#F7CEB3" />
          <stop offset="90%" stopColor="#D48B5D" />
          <stop offset="100%" stopColor="#964C22" />
        </linearGradient>

        {/* Warm fleshy blush for fingertips and thenar pad */}
        <radialGradient id="fleshy_blush_lh" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FF9F85" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#F87171" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#DE9A6F" stopOpacity="0" />
        </radialGradient>

        {/* Thenar pad (Gò Kim Tinh) rounded volume */}
        <radialGradient id="thenar_mound_lh" cx="42%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFF2E7" />
          <stop offset="40%" stopColor="#F9D2B7" />
          <stop offset="75%" stopColor="#DE9A6F" />
          <stop offset="100%" stopColor="#A0552B" />
        </radialGradient>

        {/* Palmar hollow (Hõm lòng bàn tay) soft shadow */}
        <radialGradient id="palm_hollow_lh" cx="55%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#8C441E" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#B3653A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F5C4A0" stopOpacity="0" />
        </radialGradient>

        {/* Translucent glossy fingernail gradient */}
        <linearGradient id="nail_lh" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8F4" />
          <stop offset="25%" stopColor="#FCDCD1" />
          <stop offset="70%" stopColor="#F8BAAA" />
          <stop offset="100%" stopColor="#E08B7A" />
        </linearGradient>

        {/* Traditional Taoist Sleeve Gradient (Cinnabar silk brocade) */}
        <linearGradient id="sleeve_silk_lh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#991B15" />
          <stop offset="35%" stopColor="#78110D" />
          <stop offset="70%" stopColor="#550A07" />
          <stop offset="100%" stopColor="#300403" />
        </linearGradient>

        {/* Metallic embroidery golden thread */}
        <linearGradient id="gold_thread_lh" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F6E27A" />
          <stop offset="25%" stopColor="#FFF5B8" />
          <stop offset="50%" stopColor="#C9A55A" />
          <stop offset="80%" stopColor="#AA821C" />
          <stop offset="100%" stopColor="#634B0B" />
        </linearGradient>

        {/* Imperial Emerald Jade Ring */}
        <linearGradient id="jade_gem_lh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="30%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>

        {/* Soft shadow filter for realistic depth */}
        <filter id="soft_ao_lh" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        </filter>
      </defs>

      {/* ================= LAYER 0: ROBE SLEEVE & WRIST ================= */}
      <g id="left_sleeve">
        {/* Soft ground shadow cast by flowing sleeve */}
        <path
          d="M 32,258 C 45,210 65,188 90,182 L 168,192 C 192,208 212,230 222,258 Z"
          fill="rgba(0,0,0,0.6)"
          filter="blur(5px)"
        />

        {/* Main silk sleeve body with folds */}
        <path
          d="M 30,260 C 42,212 62,185 90,180 L 166,190 C 190,205 210,230 220,260 Z"
          fill="url(#sleeve_silk_lh)"
          stroke="#380605"
          strokeWidth="1.5"
        />

        {/* Sleeve interior shadow cavity */}
        <path
          d="M 88,181 C 114,185 142,187 167,191 C 158,198 140,204 116,204 C 98,204 90,192 88,181 Z"
          fill="#1A0302"
          opacity="0.8"
        />

        {/* Realistic silk fold lines with double crease and specular sheen */}
        <path
          d="M 52,260 C 68,225 84,204 102,194"
          stroke="#260403"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 54,260 C 70,225 86,205 103,195"
          stroke="#C23E37"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 148,196 C 168,212 188,234 200,260"
          stroke="#260403"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 147,197 C 167,213 186,234 198,260"
          stroke="#C23E37"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Traditional Taoist Auspicious Golden Cloud Embroidery (Tường Vân Cổ Điển) */}
        <path
          d="M 94,228 C 104,220 114,222 120,228 C 126,220 138,222 142,230 C 136,236 126,235 120,230 C 112,237 98,237 94,228 Z"
          fill="none"
          stroke="url(#gold_thread_lh)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="120" cy="229" r="1.8" fill="#FFF2B2" />
        <path
          d="M 104,233 C 108,237 114,238 118,235"
          fill="none"
          stroke="#C9A55A"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Double Golden Brocade Cuff Border (Viền Vi Kim Lụa Gấm) */}
        <path
          d="M 88,181 C 114,185 142,187 167,191"
          stroke="url(#gold_thread_lh)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Braided diamond stitch overlay */}
        <path
          d="M 88,181 C 114,185 142,187 167,191"
          stroke="#68470B"
          strokeWidth="1.2"
          strokeDasharray="2,3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 88,178 C 114,182 142,184 167,188"
          stroke="#380605"
          strokeWidth="1"
          fill="none"
        />
      </g>

      {/* ================= LAYER 1: FOREARM & WRIST ================= */}
      <g id="left_wrist">
        {/* Forearm skin base with volume */}
        <path
          d="M 94,182 C 98,162 104,148 110,138 L 154,146 C 158,158 162,172 165,192 Z"
          fill="url(#skin_base_lh)"
        />
        {/* Wrist inner depth shadow */}
        <path
          d="M 94,182 C 98,164 104,150 110,140"
          stroke="url(#skin_shadow_lh)"
          strokeWidth="3.5"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M 152,148 C 156,160 160,174 163,192"
          stroke="url(#skin_shadow_lh)"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />

        {/* Anatomical Wrist Creases (Vân chỉ cổ tay - Rasceta Bracelets) */}
        {/* Crease 1 */}
        <path
          d="M 112,146 C 122,150 136,151 148,149"
          stroke="#8A4A22"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M 112,145 C 122,149 136,150 148,148"
          stroke="#FFF0E6"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {/* Crease 2 */}
        <path
          d="M 114,152 C 124,156 136,156 146,154"
          stroke="#8A4A22"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 114,151 C 124,155 136,155 146,153"
          stroke="#FFF0E6"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
      </g>

      {/* ================= LAYER 2: STALKS IN CREVICES ================= */}
      {/* Crevice 3 Stalks (Between Index & Middle): Remainder Right */}
      {crevice3Stalks > 0 && (
        <g id="stalks_crevice_3">
          {Array.from({ length: Math.min(crevice3Stalks, 4) }).map((_, i) => (
            <RealisticYarrowStalk
              key={`c3_${i}`}
              x={138 + (i - (crevice3Stalks - 1) / 2) * 5}
              y={-10}
              height={148}
              rotation={-6 + i * 3}
              glow={crevice3Stalks > 0}
              active
              accentColor="#F59E0B"
            />
          ))}
        </g>
      )}

      {/* Crevice 2 Stalks (Between Middle & Ring): Remainder Left */}
      {crevice2Stalks > 0 && (
        <g id="stalks_crevice_2">
          {Array.from({ length: Math.min(crevice2Stalks, 4) }).map((_, i) => (
            <RealisticYarrowStalk
              key={`c2_${i}`}
              x={162 + (i - (crevice2Stalks - 1) / 2) * 5}
              y={-5}
              height={152}
              rotation={2 + i * 2.5}
              glow={crevice2Stalks > 0}
              active
              accentColor="#FBBF24"
            />
          ))}
        </g>
      )}

      {/* Crevice 1 Stalk: Quải Nhất (Between Ring & Pinky) - 1 Sacred Suspended Stalk */}
      {crevice1Stalks > 0 && (
        <g id="stalk_crevice_1">
          {/* Subtle divine halo behind the sacred stalk of humanity */}
          <circle cx={186} cy={35} r={28} fill="url(#gold_thread_lh)" opacity="0.15" filter="blur(6px)" />
          <RealisticYarrowStalk
            x={186}
            y={-18}
            width={6.8}
            height={160}
            rotation={7.5}
            glow
            active
            accentColor="#FFF2B2"
          />
        </g>
      )}

      {/* ================= LAYER 3: PALM & FLESHY MOUNDS ================= */}
      <g id="left_palm">
        {/* Palm flesh base body with organic anatomical curvature */}
        <path
          d="M 108,140 C 94,126 86,110 88,92 C 92,78 102,70 116,66 C 130,62 152,65 170,73 C 188,81 198,98 199,118 C 199,136 192,148 184,154 C 174,162 156,152 148,148 C 138,144 120,144 108,140 Z"
          fill="url(#skin_base_lh)"
          stroke="#8A4A22"
          strokeWidth="0.8"
        />

        {/* Palmar hollow soft shadow (Hõm lòng bàn tay) */}
        <ellipse cx="144" cy="108" rx="28" ry="24" fill="url(#palm_hollow_lh)" />

        {/* Thenar Eminence (Gò Kim Tinh ở gốc ngón cái) - 3D fleshy volume */}
        <path
          d="M 90,92 C 86,112 96,134 114,142 C 120,132 115,116 108,102 C 102,92 95,90 90,92 Z"
          fill="url(#thenar_mound_lh)"
          opacity="0.85"
        />
        {/* Thenar rosy flush */}
        <ellipse cx="102" cy="116" rx="14" ry="16" fill="url(#fleshy_blush_lh)" />

        {/* Hypothenar Eminence (Gò Thái Âm mé ngón út) */}
        <path
          d="M 176,118 C 188,130 190,144 182,154 C 175,142 173,128 176,118 Z"
          fill="#DE9A6F"
          opacity="0.6"
        />

        {/* Four Finger-Base Pads (Gò Mộc Tinh, Thổ Tinh, Thái Dương, Thủy Tinh) */}
        <ellipse cx="124" cy="74" rx="8" ry="4" fill="#FFEFE3" opacity="0.6" />
        <ellipse cx="145" cy="72" rx="8" ry="4" fill="#FFEFE3" opacity="0.6" />
        <ellipse cx="166" cy="76" rx="7" ry="4" fill="#FFEFE3" opacity="0.5" />
        <ellipse cx="186" cy="84" rx="6" ry="4" fill="#FFEFE3" opacity="0.5" />

        {/* ================= AUTHENTIC PALM CREASES (ĐƯỜNG CHỈ TAY CỔ TRUYỀN) ================= */}
        {/* 1. Đường Tâm Đạo (Heart Line - sweeping beneath finger pads) */}
        <path
          d="M 188,104 C 170,94 148,88 126,82 C 120,80 116,78 114,75"
          stroke="#7A3D19"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M 188,103 C 170,93 148,87 126,81"
          stroke="#FFF2E8"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {/* Branch crease */}
        <path
          d="M 152,89 C 145,84 138,82 134,80"
          stroke="#7A3D19"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* 2. Đường Trí Đạo (Head Line - crossing mid-palm) */}
        <path
          d="M 100,94 C 118,102 144,110 166,126"
          stroke="#7A3D19"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 100,93 C 118,101 144,109 166,125"
          stroke="#FFF2E8"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* 3. Đường Sinh Đạo (Life Line - framing Thenar eminence) */}
        <path
          d="M 98,96 C 104,116 116,134 128,142"
          stroke="#7A3D19"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 98,95 C 104,115 116,133 128,141"
          stroke="#FFF2E8"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>

      {/* ================= LAYER 4: FOREGROUND FINGERS ================= */}
      {/* 1. THUMB (Ngón Cái) - cupping inwards with full joint anatomy */}
      <g id="left_thumb">
        {/* Thumb flesh body */}
        <path
          d="M 92,94 C 84,86 78,74 76,60 C 75,50 80,42 88,40 C 96,38 103,45 107,56 C 111,68 116,84 116,92 Z"
          fill="url(#finger_cyl_lh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Rosy blush on thumb pad */}
        <ellipse cx="87" cy="46" rx="6" ry="5" fill="url(#fleshy_blush_lh)" />

        {/* Thumb IP Joint Knuckle Crease (Nếp gấp đốt ngón cái) */}
        <path
          d="M 80,68 C 88,71 96,70 102,66"
          stroke="#7A3D19"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 80,67 C 88,70 96,69 102,65"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 82,72 C 89,75 96,74 100,71"
          stroke="#7A3D19"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Thumb Nail Bed & Plate (Móng tay cái chi tiết) */}
        <path
          d="M 81,46 C 85,42 91,42 95,46 C 94,52 87,54 81,46 Z"
          fill="url(#nail_lh)"
          stroke="#B3653A"
          strokeWidth="0.6"
        />
        {/* White Lunula half-moon (Liềm móng) */}
        <path
          d="M 83,49 C 85,46 89,46 92,49 Z"
          fill="#FFFFFF"
          opacity="0.8"
        />
        {/* Cuticle rim */}
        <path
          d="M 81,47 C 86,52 92,51 95,47"
          stroke="#8A4A22"
          strokeWidth="0.5"
          fill="none"
        />
        {/* Specular gloss reflection curve */}
        <path
          d="M 84,44 Q 89,43 93,46"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      </g>

      {/* 2. INDEX FINGER (Ngón Trỏ) */}
      <g id="left_index_finger">
        {/* Finger cylinder */}
        <path
          d="M 116,72 C 117,54 120,34 123,22 C 124,15 130,13 136,15 C 141,17 142,24 140,36 C 137,50 134,68 132,74 Z"
          fill="url(#finger_cyl_lh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Fingertip rosy flush */}
        <ellipse cx="130" cy="19" rx="5" ry="4" fill="url(#fleshy_blush_lh)" />

        {/* Proximal Interphalangeal (PIP) Joint Creases (Khớp đốt 2) */}
        <path
          d="M 120,44 C 126,45 132,45 137,42"
          stroke="#7A3D19"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M 120,43 C 126,44 132,44 137,41"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 121,47 C 126,48 131,48 136,45"
          stroke="#7A3D19"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Distal Interphalangeal (DIP) Joint Creases (Khớp đốt 1) */}
        <path
          d="M 122,29 C 127,30 132,30 136,28"
          stroke="#7A3D19"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 122,28 C 127,29 132,29 136,27"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* Index Nail with Lunula & Gloss */}
        <path
          d="M 125,20 C 128,15 133,15 136,19 C 135,24 128,25 125,20 Z"
          fill="url(#nail_lh)"
          stroke="#B3653A"
          strokeWidth="0.5"
        />
        <path d="M 127,22 C 129,19 133,19 134,22 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 127,17 Q 131,16 134,19" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      </g>

      {/* 3. MIDDLE FINGER (Ngón Giữa) with Imperial Emerald Jade Ring */}
      <g id="left_middle_finger">
        {/* Finger cylinder */}
        <path
          d="M 136,72 C 139,50 142,26 146,11 C 147,5 154,4 159,6 C 164,9 164,17 162,30 C 159,48 156,68 154,74 Z"
          fill="url(#finger_cyl_lh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Fingertip blush */}
        <ellipse cx="152" cy="11" rx="5" ry="4" fill="url(#fleshy_blush_lh)" />

        {/* ================= IMPERIAL EMERALD JADE RING (NHẪN PHỈ THÚY ĐẠO GIA) ================= */}
        <g id="taoist_jade_ring">
          {/* Outer 24k Gold Bezel setting with carved cloud filigree */}
          <ellipse cx="146" cy="62" rx="10" ry="4.5" fill="url(#gold_thread_lh)" stroke="#68470B" strokeWidth="0.6" />
          <path
            d="M 137,62 Q 146,59 155,62"
            stroke="#452C04"
            strokeWidth="0.8"
            strokeDasharray="1.5,1.5"
            fill="none"
          />

          {/* Translucent Imperial Green Jade Cabochon */}
          <ellipse cx="146" cy="61" rx="8" ry="3" fill="url(#jade_gem_lh)" />
          {/* Inner Jade Luminescence Glow */}
          <ellipse cx="146" cy="60.5" rx="6" ry="1.8" fill="#6EE7B7" opacity="0.75" />
          {/* Specular White Light Reflection */}
          <path
            d="M 140,60.5 Q 146,58.5 152,60.5"
            stroke="#FFFFFF"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* PIP Joint Creases */}
        <path
          d="M 142,39 C 148,41 154,41 159,38"
          stroke="#7A3D19"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M 142,38 C 148,40 154,40 159,37"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 143,43 C 148,44 153,44 158,42"
          stroke="#7A3D19"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* DIP Joint Creases */}
        <path
          d="M 145,23 C 149,24 154,24 158,22"
          stroke="#7A3D19"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 145,22 C 149,23 154,23 158,21"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* Middle Nail with Lunula & Gloss */}
        <path
          d="M 148,11 C 151,6 156,7 158,11 C 156,16 150,16 148,11 Z"
          fill="url(#nail_lh)"
          stroke="#B3653A"
          strokeWidth="0.5"
        />
        <path d="M 150,13 C 152,10 155,10 156,13 Z" fill="#FFFFFF" opacity="0.85" />
        <path d="M 150,8 Q 153,7 156,10" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      </g>

      {/* 4. RING FINGER (Ngón Áp Út) */}
      <g id="left_ring_finger">
        {/* Finger cylinder */}
        <path
          d="M 156,75 C 159,56 162,36 166,23 C 167,17 173,16 178,19 C 182,22 182,30 179,42 C 176,56 173,72 170,78 Z"
          fill="url(#finger_cyl_lh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Fingertip blush */}
        <ellipse cx="172" cy="20" rx="5" ry="4" fill="url(#fleshy_blush_lh)" />

        {/* PIP Joint Creases */}
        <path
          d="M 163,46 C 168,48 173,48 177,45"
          stroke="#7A3D19"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M 163,45 C 168,47 173,47 177,44"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 164,50 C 168,51 172,51 176,49"
          stroke="#7A3D19"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* DIP Joint Creases */}
        <path
          d="M 166,31 C 170,32 174,32 177,30"
          stroke="#7A3D19"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 166,30 C 170,31 174,31 177,29"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* Ring Nail */}
        <path
          d="M 169,21 C 172,17 176,17 178,21 C 176,26 172,26 169,21 Z"
          fill="url(#nail_lh)"
          stroke="#B3653A"
          strokeWidth="0.5"
        />
        <path d="M 171,23 C 173,20 176,20 177,23 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 171,18 Q 174,17 177,20" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      </g>

      {/* 5. PINKY FINGER (Ngón Út) - Gripping inward tightly over Crevice 1 */}
      <g id="left_pinky_finger">
        {/* Pinky path flexes inward when isClamping is true with anatomical curvature */}
        <path
          d={
            isClamping
              ? "M 175,82 C 179,68 184,53 186,43 C 187,37 193,37 196,40 C 199,43 198,51 195,62 C 192,76 188,90 184,96 Z"
              : "M 175,82 C 180,66 187,48 191,36 C 192,30 198,30 202,34 C 205,38 203,46 199,58 C 194,74 189,90 185,96 Z"
          }
          fill="url(#finger_cyl_lh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Fingertip blush */}
        <ellipse cx={isClamping ? 191 : 196} cy={isClamping ? 41 : 35} rx="4" ry="3.5" fill="url(#fleshy_blush_lh)" />

        {/* Knuckles */}
        <path
          d={
            isClamping
              ? "M 182,62 C 186,64 190,64 193,61"
              : "M 185,58 C 189,60 194,60 197,57"
          }
          stroke="#7A3D19"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />
        <path
          d={
            isClamping
              ? "M 182,61 C 186,63 190,63 193,60"
              : "M 185,57 C 189,59 194,59 197,56"
          }
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Pinky Nail */}
        <path
          d={
            isClamping
              ? "M 188,41 C 191,37 195,38 196,42 C 194,46 190,46 188,41 Z"
              : "M 193,35 C 196,31 200,32 201,36 C 199,40 195,40 193,35 Z"
          }
          fill="url(#nail_lh)"
          stroke="#B3653A"
          strokeWidth="0.5"
        />
        <path
          d={
            isClamping
              ? "M 190,38 Q 193,37 195,40"
              : "M 195,32 Q 198,31 200,34"
          }
          stroke="#FFFFFF"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Highlight overlays on the 3 crevices when inspecting in diagram mode */}
      {highlightCrevices && (
        <g id="crevice_labels" className="animate-pulse">
          {/* Crevice 1 (Út - Áp Út) */}
          <circle cx="182" cy="74" r="6" fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1.8" />
          {/* Crevice 2 (Áp Út - Giữa) */}
          <circle cx="158" cy="68" r="6" fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1.8" />
          {/* Crevice 3 (Giữa - Trỏ) */}
          <circle cx="134" cy="68" r="6" fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1.8" />
        </g>
      )}
    </svg>
  );
};

// ============================================================================
// 3. REALISTIC RIGHT HAND (Bàn Tay Phải - Cầm/Bốc/Nhón/Rút/Đếm 4 Cọng)
// ============================================================================
export type RightHandActionState =
  | "idle" // Nghỉ tự nhiên
  | "pinch_taiji" // Nhón 1 cọng Thái Cực
  | "split_hold" // Giữ bó Địa
  | "draw_trinity" // Rút 1 cọng từ bó Địa
  | "count_four" // Bốc 4 cọng Tứ Thời
  | "gather_remainder"; // Gom cọng dư kẹp ngón

interface RealisticRightHandProps {
  actionState?: RightHandActionState;
  stalkGrasped?: "none" | "single_gold" | "single_plain" | "four_stalks" | "remainder_bundle";
}

export const RealisticRightHandSvg: React.FC<RealisticRightHandProps> = ({
  actionState = "idle",
  stalkGrasped = "none",
}) => {
  return (
    <svg
      viewBox="0 0 240 260"
      className="w-full h-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] overflow-visible"
    >
      <defs>
        {/* Right hand skin gradients */}
        <linearGradient id="skin_base_rh" x1="85%" y1="0%" x2="15%" y2="100%">
          <stop offset="0%" stopColor="#FFF7F0" />
          <stop offset="25%" stopColor="#FDE3CE" />
          <stop offset="50%" stopColor="#F5C4A0" />
          <stop offset="75%" stopColor="#DE9A6F" />
          <stop offset="92%" stopColor="#B3653A" />
          <stop offset="100%" stopColor="#7E3A19" />
        </linearGradient>

        <linearGradient id="skin_shadow_rh" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A85E33" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#54240B" stopOpacity="0.95" />
        </linearGradient>

        {/* 3D Cylindrical finger lighting (Right Hand) */}
        <linearGradient id="finger_cyl_rh" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#C97E4E" />
          <stop offset="20%" stopColor="#FDE3D0" />
          <stop offset="45%" stopColor="#FFF5ED" />
          <stop offset="70%" stopColor="#F7CEB3" />
          <stop offset="90%" stopColor="#D48B5D" />
          <stop offset="100%" stopColor="#964C22" />
        </linearGradient>

        {/* Fleshy warm blush */}
        <radialGradient id="fleshy_blush_rh" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FF9F85" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#F87171" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#DE9A6F" stopOpacity="0" />
        </radialGradient>

        {/* Translucent fingernail */}
        <linearGradient id="nail_rh" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8F4" />
          <stop offset="25%" stopColor="#FCDCD1" />
          <stop offset="70%" stopColor="#F8BAAA" />
          <stop offset="100%" stopColor="#E08B7A" />
        </linearGradient>

        {/* Traditional Taoist Sleeve Gradient (Right) */}
        <linearGradient id="sleeve_silk_rh" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#991B15" />
          <stop offset="35%" stopColor="#78110D" />
          <stop offset="70%" stopColor="#550A07" />
          <stop offset="100%" stopColor="#300403" />
        </linearGradient>

        {/* Metallic embroidery golden thread */}
        <linearGradient id="gold_thread_rh" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#F6E27A" />
          <stop offset="25%" stopColor="#FFF5B8" />
          <stop offset="50%" stopColor="#C9A55A" />
          <stop offset="80%" stopColor="#AA821C" />
          <stop offset="100%" stopColor="#634B0B" />
        </linearGradient>

        {/* Sacred Taoist Agarwood/Cinnabar Prayer Bead Gradient (Chuỗi Vòng Tay Trầm Hương) */}
        <radialGradient id="prayer_bead_rh" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#E88C52" />
          <stop offset="30%" stopColor="#B45309" />
          <stop offset="70%" stopColor="#78350F" />
          <stop offset="95%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#1E0B02" />
        </radialGradient>
      </defs>

      {/* ================= LAYER 0: FOREARM & ROBE SLEEVE ================= */}
      <g id="right_sleeve">
        {/* Soft shadow cast by flowing right sleeve */}
        <path
          d="M 20,258 C 30,228 50,205 75,190 L 152,180 C 178,185 198,212 210,258 Z"
          fill="rgba(0,0,0,0.6)"
          filter="blur(5px)"
        />

        {/* Flowing wide robe sleeve body */}
        <path
          d="M 18,260 C 28,228 48,204 74,188 L 150,178 C 178,184 198,210 208,260 Z"
          fill="url(#sleeve_silk_rh)"
          stroke="#380605"
          strokeWidth="1.5"
        />

        {/* Sleeve interior shadow cavity */}
        <path
          d="M 74,188 C 100,184 126,182 150,178 C 144,188 126,195 106,196 C 88,196 78,193 74,188 Z"
          fill="#1A0302"
          opacity="0.8"
        />

        {/* Silk fold creases with sheen */}
        <path
          d="M 186,260 C 168,222 150,202 130,192"
          stroke="#260403"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 184,260 C 166,222 148,203 129,193"
          stroke="#C23E37"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 92,194 C 70,212 50,234 38,260"
          stroke="#260403"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 93,195 C 71,213 52,234 40,260"
          stroke="#C23E37"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Taoist Golden Cloud Embroidery */}
        <path
          d="M 146,228 C 136,220 126,222 120,228 C 114,220 102,222 98,230 C 104,236 114,235 120,230 C 128,237 142,237 146,228 Z"
          fill="none"
          stroke="url(#gold_thread_rh)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="120" cy="229" r="1.8" fill="#FFF2B2" />

        {/* Golden Brocade Cuff Border */}
        <path
          d="M 74,188 C 100,184 126,182 150,178"
          stroke="url(#gold_thread_rh)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 74,188 C 100,184 126,182 150,178"
          stroke="#68470B"
          strokeWidth="1.2"
          strokeDasharray="2,3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ================= LAYER 1: FOREARM & WRIST ================= */}
      <g id="right_wrist">
        {/* Forearm skin base */}
        <path
          d="M 86,145 L 132,138 C 138,148 144,162 147,180 L 76,189 C 78,168 82,154 86,145 Z"
          fill="url(#skin_base_rh)"
        />

        {/* Shading */}
        <path
          d="M 146,178 C 142,163 137,150 132,140"
          stroke="url(#skin_shadow_rh)"
          strokeWidth="3.5"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M 78,187 C 80,168 84,155 87,146"
          stroke="url(#skin_shadow_rh)"
          strokeWidth="3"
          fill="none"
          opacity="0.5"
        />

        {/* Styloid process of ulna (Mỏm trâm xương trụ - knuckle bump at outer wrist) */}
        <ellipse cx="80" cy="162" rx="4" ry="6" fill="#FFEFE3" opacity="0.65" filter="blur(1px)" />

        {/* Wrist crease lines */}
        <path
          d="M 90,150 C 102,152 116,151 126,147"
          stroke="#8A4A22"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M 90,149 C 102,151 116,150 126,146"
          stroke="#FFF0E6"
          strokeWidth="0.7"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M 94,155 C 104,157 114,156 122,152"
          stroke="#8A4A22"
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* ================= SACRED TAOIST PRAYER BEAD BRACELET (CHUỖI TRẦM HƯƠNG / SAN HÔ) ================= */}
        <g id="prayer_beads_bracelet">
          {/* Bead 1 */}
          <circle cx="83" cy="168" r="5" fill="url(#prayer_bead_rh)" stroke="#381404" strokeWidth="0.5" />
          <ellipse cx="81.5" cy="166.5" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.75" />
          {/* Bead 2 */}
          <circle cx="93" cy="170" r="5.2" fill="url(#prayer_bead_rh)" stroke="#381404" strokeWidth="0.5" />
          <ellipse cx="91.5" cy="168.5" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.75" />
          {/* Bead 3 - Golden Guru Spacer Bead */}
          <circle cx="104" cy="171" r="5.5" fill="url(#gold_thread_rh)" stroke="#5E3E07" strokeWidth="0.6" />
          <ellipse cx="102.5" cy="169.5" rx="1.8" ry="1.2" fill="#FFFFFF" opacity="0.9" />
          {/* Tassel cord dangling from Guru bead */}
          <path d="M 104,176.5 C 104,181 103,185 102,190" stroke="#DC2626" strokeWidth="1.2" fill="none" />
          <circle cx="102" cy="191" r="1.5" fill="#EF4444" />
          {/* Bead 4 */}
          <circle cx="115" cy="170" r="5.2" fill="url(#prayer_bead_rh)" stroke="#381404" strokeWidth="0.5" />
          <ellipse cx="113.5" cy="168.5" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.75" />
          {/* Bead 5 */}
          <circle cx="126" cy="168" r="5" fill="url(#prayer_bead_rh)" stroke="#381404" strokeWidth="0.5" />
          <ellipse cx="124.5" cy="166.5" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.75" />
          {/* Bead 6 */}
          <circle cx="136" cy="164" r="4.8" fill="url(#prayer_bead_rh)" stroke="#381404" strokeWidth="0.5" />
          <ellipse cx="134.5" cy="162.5" rx="1.5" ry="1" fill="#FFFFFF" opacity="0.75" />
        </g>
      </g>

      {/* ================= LAYER 2: STALKS GRASPED IN HAND ================= */}
      {/* 1. Single Gold Stalk (Thái Cực) */}
      {stalkGrasped === "single_gold" && (
        <g id="grasped_single_gold">
          {/* Divine halo aura */}
          <circle cx={104} cy={45} r={32} fill="url(#gold_thread_rh)" opacity="0.2" filter="blur(8px)" />
          <RealisticYarrowStalk
            x={104}
            y={-12}
            width={7.2}
            height={155}
            rotation={-4}
            glow
            active
            accentColor="#FFF9B8"
          />
        </g>
      )}

      {/* 2. Single Plain Stalk (Tam Tài rút từ bó Địa) */}
      {stalkGrasped === "single_plain" && (
        <g id="grasped_single_plain">
          <RealisticYarrowStalk
            x={104}
            y={-6}
            width={6.2}
            height={150}
            rotation={-6}
            glow
            active
            accentColor="#FBBF24"
          />
        </g>
      )}

      {/* 3. Four Stalks (Bốc 4 cọng Tứ Thời) */}
      {stalkGrasped === "four_stalks" && (
        <g id="grasped_four_stalks">
          <RealisticYarrowStalk x={95} y={-6} width={5.6} height={148} rotation={-9} active accentColor="#60A5FA" />
          <RealisticYarrowStalk x={101} y={-9} width={5.6} height={151} rotation={-5} active accentColor="#34D399" />
          <RealisticYarrowStalk x={107} y={-9} width={5.6} height={151} rotation={-1} active accentColor="#FBBF24" />
          <RealisticYarrowStalk x={113} y={-6} width={5.6} height={148} rotation={3.5} active accentColor="#F87171" />
        </g>
      )}

      {/* 4. Remainder Bundle (Gom cọng Nhuận) */}
      {stalkGrasped === "remainder_bundle" && (
        <g id="grasped_remainder_bundle">
          {Array.from({ length: 5 }).map((_, i) => (
            <RealisticYarrowStalk
              key={`rem_${i}`}
              x={97 + i * 4.2}
              y={-10 + (i % 2) * 3}
              width={5.6}
              height={152}
              rotation={-8 + i * 4}
              glow
              active
              accentColor="#F43F5E"
            />
          ))}
        </g>
      )}

      {/* ================= LAYER 3: DORSAL PALM & REAR FINGERS ================= */}
      <g id="right_palm_and_fingers">
        {/* Dorsal Hand Flesh Body (Mu Bàn Tay) with anatomical form */}
        <path
          d="M 86,144 C 72,136 62,122 64,104 C 66,90 78,78 94,72 C 112,66 132,68 144,78 C 150,84 152,96 148,110 C 143,124 136,136 126,142 Z"
          fill="url(#skin_base_rh)"
          stroke="#8A4A22"
          strokeWidth="0.9"
        />

        {/* Extensor Tendon Highlights (Gân mu bàn tay) */}
        <path
          d="M 120,138 C 118,118 114,95 110,80"
          stroke="#FFF2E8"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M 108,140 C 104,120 98,100 96,82"
          stroke="#FFF2E8"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />
        <path
          d="M 96,142 C 90,122 84,105 82,90"
          stroke="#FFF2E8"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />

        {/* Metacarpophalangeal Knuckle Mounds (Gờ khớp xương bàn ngón) */}
        <ellipse cx="112" cy="78" rx="6" ry="4" fill="#FFEFE3" opacity="0.55" />
        <ellipse cx="98" cy="80" rx="5.5" ry="4" fill="#FFEFE3" opacity="0.5" />
        <ellipse cx="84" cy="86" rx="5" ry="4" fill="#FFEFE3" opacity="0.45" />
        <ellipse cx="70" cy="100" rx="4.5" ry="4" fill="#FFEFE3" opacity="0.4" />

        {/* 1. PINKY FINGER (Ngón út buông lơi thanh thoát - Phượng Vĩ Chỉ) */}
        <g id="right_pinky">
          <path
            d="M 68,104 C 62,94 56,80 54,67 C 53,61 58,57 64,59 C 70,61 74,69 76,82 C 78,92 78,100 76,108 Z"
            fill="url(#finger_cyl_rh)"
            stroke="#8A4A22"
            strokeWidth="0.9"
          />
          {/* Rosy tip */}
          <ellipse cx="58" cy="63" rx="4" ry="3.5" fill="url(#fleshy_blush_rh)" />
          {/* Knuckle creases */}
          <path
            d="M 62,78 C 66,80 70,80 73,77"
            stroke="#7A3D19"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          {/* Pinky nail with gloss */}
          <path
            d="M 55,65 C 57,61 61,61 63,64 C 62,68 58,69 55,65 Z"
            fill="url(#nail_rh)"
            stroke="#B3653A"
            strokeWidth="0.5"
          />
          <path d="M 56,62 Q 59,61 61,63" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        </g>

        {/* 2. RING FINGER (Ngón áp út cong nhẹ tao nhã) */}
        <g id="right_ring">
          <path
            d="M 76,88 C 72,76 68,60 68,45 C 68,39 74,37 79,40 C 84,43 87,51 87,64 C 88,78 88,88 84,94 Z"
            fill="url(#finger_cyl_rh)"
            stroke="#8A4A22"
            strokeWidth="0.9"
          />
          {/* Rosy tip */}
          <ellipse cx="73" cy="43" rx="4.5" ry="3.5" fill="url(#fleshy_blush_rh)" />
          {/* Knuckle creases */}
          <path
            d="M 74,62 C 78,64 82,64 85,61"
            stroke="#7A3D19"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 74,61 C 78,63 82,63 85,60"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          {/* Ring nail */}
          <path
            d="M 69,43 C 72,39 76,40 78,43 C 77,47 73,48 69,43 Z"
            fill="url(#nail_rh)"
            stroke="#B3653A"
            strokeWidth="0.5"
          />
          <path d="M 71,40 Q 74,39 76,42" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        </g>

        {/* 3. MIDDLE FINGER (Ngón giữa - làm điểm tựa cầm cọng) */}
        <g id="right_middle">
          <path
            d="M 88,76 C 88,60 90,40 92,25 C 93,19 100,18 104,21 C 108,24 108,33 105,46 C 102,60 99,74 97,80 Z"
            fill="url(#finger_cyl_rh)"
            stroke="#8A4A22"
            strokeWidth="0.9"
          />
          {/* Rosy tip */}
          <ellipse cx="98" cy="23" rx="4.5" ry="3.5" fill="url(#fleshy_blush_rh)" />
          {/* Knuckle creases */}
          <path
            d="M 94,44 C 98,46 102,46 105,43"
            stroke="#7A3D19"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 94,43 C 98,45 102,45 105,42"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          {/* Middle nail with gloss */}
          <path
            d="M 93,23 C 96,19 100,20 102,24 C 100,28 96,28 93,23 Z"
            fill="url(#nail_rh)"
            stroke="#B3653A"
            strokeWidth="0.5"
          />
          <path d="M 95,20 Q 98,19 100,22" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>

        {/* ================= LAYER 4: PINCHING FINGERS (INDEX & THUMB - NIÊM HOA CHỈ / CHỈ QUYẾT) ================= */}
        {/* 4. INDEX FINGER (Ngón Trỏ Nhón Cỏ Thi) */}
        <g id="right_index">
          {/* Curved index pinching body */}
          <path
            d="M 104,74 C 107,56 112,38 116,23 C 117,16 124,15 128,18 C 132,21 131,29 126,44 C 120,60 114,72 110,80 Z"
            fill="url(#finger_cyl_rh)"
            stroke="#8A4A22"
            strokeWidth="0.9"
          />

          {/* Compressed fleshy pad pressing against stalk/thumb */}
          <ellipse cx="121" cy="24" rx="5" ry="4" fill="url(#fleshy_blush_rh)" />

          {/* PIP Knuckle Creases (Khớp đốt ngón trỏ) */}
          <path
            d="M 111,46 C 117,47 122,46 126,42"
            stroke="#7A3D19"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 111,45 C 117,46 122,45 126,41"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 112,50 C 117,51 121,50 125,46"
            stroke="#7A3D19"
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* DIP Knuckle Crease */}
          <path
            d="M 114,32 C 118,33 122,33 126,30"
            stroke="#7A3D19"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 114,31 C 118,32 122,32 126,29"
            stroke="#FFFFFF"
            strokeWidth="0.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.55"
          />

          {/* Index Nail in 3/4 Perspective with Lunula & Gloss */}
          <path
            d="M 117,21 C 120,17 124,17 126,21 C 124,25 120,25 117,21 Z"
            fill="url(#nail_rh)"
            stroke="#B3653A"
            strokeWidth="0.5"
          />
          <path d="M 119,23 C 121,20 124,20 125,23 Z" fill="#FFFFFF" opacity="0.8" />
          <path d="M 119,18 Q 122,17 124,20" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>

        {/* 5. THUMB (Ngón Cái Khép Chặt Đầu Ngón Trỏ Nhón Cỏ) */}
        <g id="right_thumb">
          {/* Thumb fleshy body with opposable grip tension */}
          <path
            d="M 134,86 C 139,76 140,62 136,48 C 133,39 127,37 120,39 C 113,42 111,52 115,64 C 118,76 124,88 126,94 Z"
            fill="url(#finger_cyl_rh)"
            stroke="#8A4A22"
            strokeWidth="0.9"
          />

          {/* Compressed thumb pad with rosy warm flush where pressing stalk */}
          <ellipse cx="123" cy="43" rx="5.5" ry="4.5" fill="url(#fleshy_blush_rh)" />

          {/* Thumb IP Knuckle Crease (Nếp gấp đốt ngón cái phải) */}
          <path
            d="M 122,58 C 127,61 133,60 137,55"
            stroke="#7A3D19"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M 122,57 C 127,60 133,59 137,54"
            stroke="#FFFFFF"
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 124,62 C 128,64 133,63 136,59"
            stroke="#7A3D19"
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />

          {/* Thumb Nail in 3/4 Perspective with Lunula & Specular Arc */}
          <path
            d="M 123,41 C 127,38 131,39 133,44 C 129,47 124,46 123,41 Z"
            fill="url(#nail_rh)"
            stroke="#B3653A"
            strokeWidth="0.5"
          />
          <path d="M 126,43 C 128,40 131,41 132,44 Z" fill="#FFFFFF" opacity="0.8" />
          <path d="M 124,39 Q 128,37 131,41" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
};

// ============================================================================
// 4. REALISTIC WOVEN BAMBOO SILK MAT & ALTAR STANDS
// ============================================================================
interface AltarMatProps {
  leftCount: number;
  rightCount: number;
  isCountingLeft?: boolean;
  activeCycle?: number;
}

export const RealisticAltarMat: React.FC<AltarMatProps> = ({
  leftCount,
  rightCount,
  isCountingLeft = true,
  activeCycle = 0,
}) => {
  return (
    <div className="relative w-full h-[180px] sm:h-[220px] rounded-2xl bg-gradient-to-b from-[#181008] via-[#140D06] to-[#0D0804] border border-[#442E19] overflow-hidden flex items-end justify-between p-4 sm:p-6 shadow-inner select-none">
      {/* Floor texture: Woven bamboo mat weave (Chiếu trúc đan) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[linear-gradient(to_right,#C89B3C_1px,transparent_1px),linear-gradient(to_bottom,#C89B3C_1px,transparent_1px)] bg-[size:16px_8px]" />
      </div>

      {/* Center Bagua Yin-Yang Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#C9A55A]/20 flex items-center justify-center pointer-events-none opacity-25">
        <div className="w-32 h-32 rounded-full border border-dashed border-[#C9A55A]/40 animate-[spin_90s_linear_infinite]" />
        <div className="absolute text-3xl font-serif text-[#C9A55A]/40 select-none">☯</div>
      </div>

      {/* ================= LEFT TRAY MAT: HEAVEN (ĐỆM THIÊN / BÓ TRÁI) ================= */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Silk Cushion Base */}
        <div className="relative w-48 sm:w-60 h-16 sm:h-20 rounded-[28px] bg-gradient-to-r from-[#29170C] via-[#3D2513] to-[#29170C] border-2 border-[#8C6218]/60 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-visible">
          {/* Silk Embroidery border */}
          <div className="absolute inset-1 rounded-[24px] border border-[#C9A55A]/30 border-dashed pointer-events-none" />

          {/* Stalks Bundle Fan-out (Thiên - 3D Realistic Rods) */}
          <div className="absolute bottom-4 flex items-center -space-x-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const rot = (i - 7) * 2.8;
              const isAnimated = isCountingLeft && i % 4 === activeCycle;
              return (
                <motion.div
                  key={`left_stalk_${i}`}
                  animate={isAnimated ? { y: [-2, -10, 0], scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-1.5 h-16 sm:h-20 bg-gradient-to-b from-[#FFF2B8] via-[#D4A144] to-[#6E4413] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.6)] border-t border-[#FFE57F] relative"
                  style={{
                    transform: `rotate(${rot}deg)`,
                  }}
                >
                  {/* Subtle nodes */}
                  <div className="absolute top-1/4 inset-x-0 h-[1.5px] bg-[#54330B]" />
                  <div className="absolute top-2/3 inset-x-0 h-[1.5px] bg-[#54330B]" />
                </motion.div>
              );
            })}
          </div>

          {/* Label Badge */}
          <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-[#180E07] border border-[#6A431F] text-[10px] sm:text-xs font-mono font-bold text-[#E5C378] shadow-md flex items-center gap-1.5 z-20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Bó Trái (Thiên • Trời): <strong className="text-white font-bold">{leftCount}</strong> cọng</span>
          </div>
        </div>
      </div>

      {/* ================= CENTER: SACRED TAIJI ALTAR MARK ================= */}
      <div className="relative z-10 flex flex-col items-center pb-2 opacity-75">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C7A65]">
          Tam Tài Định Vị
        </span>
        <span className="text-xs font-serif font-bold text-[#C9A55A]">
          Thiên • Địa • Nhân
        </span>
      </div>

      {/* ================= RIGHT TRAY MAT: EARTH (ĐỆM ĐỊA / BÓ PHẢI) ================= */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Silk Cushion Base */}
        <div className="relative w-48 sm:w-60 h-16 sm:h-20 rounded-[28px] bg-gradient-to-r from-[#29170C] via-[#3D2513] to-[#29170C] border-2 border-[#8C6218]/60 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-visible">
          {/* Silk Embroidery border */}
          <div className="absolute inset-1 rounded-[24px] border border-[#C9A55A]/30 border-dashed pointer-events-none" />

          {/* Stalks Bundle Fan-out (Địa - 3D Realistic Rods) */}
          <div className="absolute bottom-4 flex items-center -space-x-2">
            {Array.from({ length: 14 }).map((_, i) => {
              const rot = (i - 7) * -2.8;
              const isAnimated = !isCountingLeft && i % 4 === activeCycle;
              return (
                <motion.div
                  key={`right_stalk_${i}`}
                  animate={isAnimated ? { y: [-2, -10, 0], scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-1.5 h-16 sm:h-20 bg-gradient-to-b from-[#FFF2B8] via-[#D4A144] to-[#6E4413] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.6)] border-t border-[#FFE57F] relative"
                  style={{
                    transform: `rotate(${rot}deg)`,
                  }}
                >
                  {/* Subtle nodes */}
                  <div className="absolute top-1/4 inset-x-0 h-[1.5px] bg-[#54330B]" />
                  <div className="absolute top-2/3 inset-x-0 h-[1.5px] bg-[#54330B]" />
                </motion.div>
              );
            })}
          </div>

          {/* Label Badge */}
          <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-[#180E07] border border-[#6A431F] text-[10px] sm:text-xs font-mono font-bold text-[#A7F3D0] border-emerald-900/60 shadow-md flex items-center gap-1.5 z-20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Bó Phải (Địa • Đất): <strong className="text-white font-bold">{rightCount}</strong> cọng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
