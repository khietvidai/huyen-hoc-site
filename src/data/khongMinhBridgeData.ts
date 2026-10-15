import rawData from "./khongMinhBridgeData.json";

export interface PoemSegment {
  hanzi: string;
  transcription: string;
  meaning: string;
  analysis?: string;
}

export interface KhongMinhLineItem {
  line: number;
  lineName: string;
  lineHanzi?: string;
  tuongHao: string;
  tuongHaoHanzi?: string;
  tuongHaoMeaning?: string;
  yHao: string;
  yHaoHanzi?: string;
  yHaoMeaning?: string;
  oracleNum: number;
  oracleHanzi?: string;
  oracleText: string;
  oracleMeaning?: string;
  poemSegments?: PoemSegment[];
  historicalAllusion?: string;
  philosophicalMeaning?: string;
}

export interface KhongMinhHexagramBridge {
  orderIndex: number;
  name: string;
  hanzi?: string;
  kingWenNumber: number;
  vietnameseName?: string;
  tuongQue: string;
  tuongQueHanzi?: string;
  tuongQueMeaning?: string;
  yQue: string;
  yQueHanzi?: string;
  yQueMeaning?: string;
  lines: KhongMinhLineItem[];
}

export const KHONG_MINH_HEXAGRAMS: KhongMinhHexagramBridge[] = rawData as KhongMinhHexagramBridge[];

export const KHONG_MINH_BY_KING_WEN: Record<number, KhongMinhHexagramBridge> = {};
for (const item of KHONG_MINH_HEXAGRAMS) {
  KHONG_MINH_BY_KING_WEN[item.kingWenNumber] = item;
}

export const getKhongMinhForHexagram = (kingWenNumber: number): KhongMinhHexagramBridge | undefined => {
  return KHONG_MINH_BY_KING_WEN[kingWenNumber];
};

export const getKhongMinhOracleByNumber = (oracleNumber: number): { hex: KhongMinhHexagramBridge; line: KhongMinhLineItem } | undefined => {
  for (const h of KHONG_MINH_HEXAGRAMS) {
    for (const l of h.lines) {
      if (l.oracleNum === oracleNumber) {
        return { hex: h, line: l };
      }
    }
  }
  return undefined;
};
