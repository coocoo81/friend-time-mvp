export const SLOT_CONFIG = [
  {
    key: "morning",
    label: "上午",
    time: "09:00 - 12:00",
    order: 0
  },
  {
    key: "afternoon",
    label: "下午",
    time: "13:00 - 18:00",
    order: 1
  },
  {
    key: "evening",
    label: "晚上",
    time: "18:00 - 22:00",
    order: 2
  }
] as const;

export type SlotKey = (typeof SLOT_CONFIG)[number]["key"];

export const SLOT_KEYS = SLOT_CONFIG.map((slot) => slot.key) as SlotKey[];
