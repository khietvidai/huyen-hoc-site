import { JiaziEntry, JiaziSoundSymbolism, JiaziHexagramLink } from "./types";
import { JIAZI_GROUP_1 } from "./jiaziGroup1";
import { JIAZI_GROUP_2 } from "./jiaziGroup2";
import { JIAZI_GROUP_3 } from "./jiaziGroup3";
import { getJiaziSoundSymbolism, NAP_AM_SOUND_RECORDS } from "./soundSymbolism";
import { JIAZI_HEXAGRAM_LINKS, getJiaziHexagramLink } from "./jiaziHexagramMap";

export * from "./types";
export * from "./soundSymbolism";
export * from "./jiaziHexagramMap";

export type JiaziEnrichedEntry = JiaziEntry & {
  soundSymbolism: JiaziSoundSymbolism;
  hexagramLink: JiaziHexagramLink;
};

export const SIXTY_JIAZI: JiaziEnrichedEntry[] = [
  ...JIAZI_GROUP_1,
  ...JIAZI_GROUP_2,
  ...JIAZI_GROUP_3,
]
  .map((item) => ({
    ...item,
    soundSymbolism: getJiaziSoundSymbolism(item.id),
    hexagramLink: getJiaziHexagramLink(item.order) || JIAZI_HEXAGRAM_LINKS[item.order - 1],
  }))
  .sort((a, b) => a.order - b.order);

export const JIAZI_BRANCH_LIST: JiaziEntry["branchGroup"][] = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];

export const JIAZI_CAN_LIST = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
] as const;

export function getJiaziById(id: string): JiaziEnrichedEntry | undefined {
  return SIXTY_JIAZI.find((item) => item.id === id);
}

export function getJiaziByOrder(order: number): JiaziEnrichedEntry | undefined {
  return SIXTY_JIAZI.find((item) => item.order === order);
}
