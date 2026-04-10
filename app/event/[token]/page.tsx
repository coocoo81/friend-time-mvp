import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AvailabilityForm } from "@/components/availability-form";
import { ResultBoard } from "@/components/result-board";
import { ShareLinkActions } from "@/components/share-link-actions";
import { SiteHeader } from "@/components/site-header";
import { enumerateDates, formatDisplayDate } from "@/lib/date";
import { buildEventViewModel, getEventByToken } from "@/lib/event-service";

type EventPageProps = {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { token } = await params;
  const { created } = await searchParams;
  const event = await getEventByToken(token);

  if (!event) {
    notFound();
  }

  const viewModel = buildEventViewModel(event);
  const headerStore = await headers();
  const host = headerStore.get("host");
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (host?.includes("localhost") ? "http" : "https");
  const shareUrl = host ? `${protocol}://${host}/event/${token}` : `/event/${token}`;
  const totalDays = enumerateDates(event.startDate, event.endDate).length;
  const finalizedLabel = viewModel.finalizedSlot
    ? `${viewModel.finalizedSlot.dateLabel} · ${viewModel.finalizedSlot.slotLabel} ${viewModel.finalizedSlot.slotTime}`
    : null;

  return (
    <>
      <SiteHeader />
      <main className="page-shell pt-2">
        {created === "1" ? (
          <div className="mb-4 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <p className="font-semibold">活动已创建成功</p>
            <p className="mt-1">现在最重要的一步，就是复制下面的邀请链接发给朋友。</p>
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <div className="card rounded-[30px] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--primary-deep)]">
                  {viewModel.finalizedSlot ? "已确定时间" : "征集中"}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                  {totalDays} 天候选日期
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                  {viewModel.participantCount} 人已填写
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">{event.title}</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {event.description?.trim() || "发起人还没有补充活动说明。"}
              </p>
              <div className="mt-4 rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                候选日期范围：{formatDisplayDate(event.startDate)} 到 {formatDisplayDate(event.endDate)}
              </div>
              <div className="mt-5 rounded-3xl border border-[var(--line)] bg-white/80 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">邀请朋友一起选时间</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">把下面这个链接发给朋友，打开后即可填写。</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--accent)]/40 px-4 py-3">
                  <p className="break-all text-sm leading-6 text-[var(--foreground)]">{shareUrl}</p>
                </div>
                <ShareLinkActions shareUrl={shareUrl} />
              </div>
            </div>

            <AvailabilityForm
              token={token}
              dates={viewModel.grid
                .filter((item) => item.slotKey === "morning")
                .map((item) => ({ key: item.dateKey, label: item.dateLabel }))}
              existingParticipants={viewModel.participants}
              finalizedLabel={finalizedLabel}
            />
          </div>

          <ResultBoard
            token={token}
            participantCount={viewModel.participantCount}
            participants={viewModel.participants.map((item) => ({ id: item.id, nickname: item.nickname }))}
            grid={viewModel.grid}
            bestSlots={viewModel.allAvailableSlots.length > 0 ? viewModel.allAvailableSlots : viewModel.bestSlots}
            finalizedSlot={viewModel.finalizedSlot}
          />
        </section>

        <div className="mt-6 text-center text-sm text-[var(--muted)]">
          想重新发起一个聚会？
          <Link href="/create" className="ml-2 font-semibold text-[var(--primary-deep)]">
            再创建一个活动
          </Link>
        </div>
      </main>
    </>
  );
}
