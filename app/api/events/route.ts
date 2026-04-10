import { NextResponse } from "next/server";
import { createEventSchema } from "@/lib/validation";
import { parseDateOnly } from "@/lib/date";
import { createShareToken } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "请检查活动信息",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const startDate = parseDateOnly(parsed.data.startDate);
    const endDate = parseDateOnly(parsed.data.endDate);

    if (!startDate || !endDate) {
      return NextResponse.json({ ok: false, message: "日期格式不正确" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: parsed.data.title.trim(),
        description: parsed.data.description?.trim() || null,
        startDate,
        endDate,
        shareToken: createShareToken()
      }
    });

    return NextResponse.json({ ok: true, token: event.shareToken });
  } catch {
    return NextResponse.json({ ok: false, message: "创建活动失败，请稍后再试。" }, { status: 500 });
  }
}
