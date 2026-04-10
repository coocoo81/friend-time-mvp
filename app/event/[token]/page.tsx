import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AvailabilityForm } from "@/components/availability-form";
import { ResultBoard } from "@/components/result-board";
import { ShareLinkActions } from "@/components/share-link-actions";
import { SiteHeader } from "@/components/site-header";
import { buildEventViewModel, getEventByToken } from "@/lib/event-service";

type EventPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const { token } = await params;
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

  return (
    <>
      <SiteHeader />
      <main className="page-shell pt-2">
        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <div className="card rounded-[30px] p-5">
              <p className="text-sm font-medium text-[var(--primary-deep)]">活动信息</p>
              <h1 className="mt-3 text-3xl font-semibold">{event.title}</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {event.description?.trim() || "发起人还没有补充活动说明。"}
              </p>
              <div className="mt-5 rounded-3xl border border-[var(--line)] bg-white/80 p-4 text-sm">
                <p className="font-semibold">分享链接</p>
                <p className="mt-2 break-all text-[var(--muted)]">{shareUrl}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  本地开发时可直接复制当前页面地址发给朋友测试。
                </p>
                <ShareLinkActions shareUrl={shareUrl} title={event.title} />
              </div>
            </div>

            <AvailabilityForm
              token={token}
              dates={viewModel.grid
                .filter((item) => item.slotKey === "morning")
                .map((item) => ({ key: item.dateKey, label: item.dateLabel }))}
              existingParticipants={viewModel.participants}
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
