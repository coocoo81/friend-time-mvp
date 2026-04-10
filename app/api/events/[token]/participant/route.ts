import { NextResponse } from "next/server";
import { getEventByToken, getParticipantSelection } from "@/lib/event-service";

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const nickname = new URL(request.url).searchParams.get("nickname")?.trim();

  if (!nickname) {
    return NextResponse.json({ ok: false, message: "缺少昵称" }, { status: 400 });
  }

  const event = await getEventByToken(token);

  if (!event) {
    return NextResponse.json({ ok: false, message: "活动不存在" }, { status: 404 });
  }

  const participant = await getParticipantSelection(event.id, nickname);
  return NextResponse.json({ ok: true, participant });
}
