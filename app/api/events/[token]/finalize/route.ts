import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getEventByToken } from "@/lib/event-service";
import { finalizeSelectionSchema } from "@/lib/validation";
import { parseDateOnly, toDateOnlyString } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;

  try {
    const event = await getEventByToken(token);
    if (!event) {
      return NextResponse.json({ ok: false, message: "活动不存在" }, { status: 404 });
    }

    const json = await request.json();
    const parsed = finalizeSelectionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "确认的时间不合法" }, { status: 400 });
    }

    const finalizedDate = parseDateOnly(parsed.data.date);
    if (!finalizedDate) {
      return NextResponse.json({ ok: false, message: "日期格式不正确" }, { status: 400 });
    }

    if (toDateOnlyString(finalizedDate) < toDateOnlyString(event.startDate) || toDateOnlyString(finalizedDate) > toDateOnlyString(event.endDate)) {
      return NextResponse.json({ ok: false, message: "最终时间超出了活动范围" }, { status: 400 });
    }

    await prisma.event.update({
      where: {
        id: event.id
      },
      data: {
        finalizedDate,
        finalizedSlotKey: parsed.data.slotKey
      }
    });

    revalidatePath(`/event/${token}`);
    return NextResponse.json({ ok: true, message: "最终时间已更新" });
  } catch {
    return NextResponse.json({ ok: false, message: "确认最终时间失败，请稍后再试。" }, { status: 500 });
  }
}
