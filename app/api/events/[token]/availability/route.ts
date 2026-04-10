import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { enumerateDates, parseDateOnly, toDateOnlyString } from "@/lib/date";
import { getEventByToken } from "@/lib/event-service";
import { prisma } from "@/lib/prisma";
import { submitAvailabilitySchema } from "@/lib/validation";

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
    const parsed = submitAvailabilitySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "请检查填写内容",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const validDateSet = new Set(enumerateDates(event.startDate, event.endDate).map(toDateOnlyString));

    for (const selection of parsed.data.selections) {
      if (!validDateSet.has(selection.date)) {
        return NextResponse.json({ ok: false, message: "选择的日期超出了活动范围" }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.upsert({
        where: {
          eventId_nickname: {
            eventId: event.id,
            nickname: parsed.data.nickname.trim()
          }
        },
        update: {},
        create: {
          eventId: event.id,
          nickname: parsed.data.nickname.trim()
        }
      });

      await tx.availability.deleteMany({
        where: {
          eventId: event.id,
          participantId: participant.id
        }
      });

      if (parsed.data.selections.length > 0) {
        await tx.availability.createMany({
          data: parsed.data.selections.map((selection) => ({
            eventId: event.id,
            participantId: participant.id,
            date: parseDateOnly(selection.date)!,
            slotKey: selection.slotKey,
            isAvailable: true
          }))
        });
      }
    });

    revalidatePath(`/event/${token}`);

    return NextResponse.json({
      ok: true,
      message: parsed.data.selections.length > 0 ? "已保存，你的时间选择已经更新。" : "已保存空白结果，可稍后再回来补充。"
    });
  } catch {
    return NextResponse.json({ ok: false, message: "提交失败，请稍后再试。" }, { status: 500 });
  }
}
