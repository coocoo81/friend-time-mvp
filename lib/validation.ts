import { z } from "zod";
import { SLOT_CONFIG } from "@/lib/constants";
import { parseDateOnly } from "@/lib/date";

const dateString = z
  .string()
  .min(1, "请选择日期")
  .refine((value) => !!parseDateOnly(value), "日期格式不正确");

const slotKeySchema = z.custom<(typeof SLOT_CONFIG)[number]["key"]>(
  (value) => typeof value === "string" && SLOT_CONFIG.some((slot) => slot.key === value),
  "时间段不合法"
);

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, "请输入活动名称").max(60, "活动名称最多 60 个字"),
    description: z.string().trim().max(300, "活动说明最多 300 个字").optional().or(z.literal("")),
    startDate: dateString,
    endDate: dateString
  })
  .superRefine((data, ctx) => {
    const startDate = parseDateOnly(data.startDate);
    const endDate = parseDateOnly(data.endDate);

    if (!startDate || !endDate) {
      return;
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: "custom",
        message: "结束日期不能早于开始日期",
        path: ["endDate"]
      });
    }
  });

export const submitAvailabilitySchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "请输入昵称")
    .max(24, "昵称最多 24 个字")
    .regex(/^[^/\\<>]+$/, "昵称不能包含特殊路径字符"),
  selections: z
    .array(
      z.object({
        date: dateString,
        slotKey: slotKeySchema
      })
    )
    .max(400, "选择的时间过多，请缩小活动范围")
});

export const finalizeSelectionSchema = z.object({
  date: dateString,
  slotKey: slotKeySchema
});
