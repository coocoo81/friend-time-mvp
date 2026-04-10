"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SLOT_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

type ParticipantSummary = {
  id: number;
  nickname: string;
};

type GridItem = {
  key: string;
  dateKey: string;
  dateLabel: string;
  slotKey: string;
  slotLabel: string;
  slotTime: string;
  availableCount: number;
  isAllAvailable: boolean;
};

type ResultBoardProps = {
  token: string;
  participantCount: number;
  participants: ParticipantSummary[];
  grid: GridItem[];
  bestSlots: GridItem[];
  finalizedSlot: GridItem | null;
};

type FinalizeResponse = { ok: true; message: string } | { ok: false; message: string };

export function ResultBoard({
  token,
  participantCount,
  participants,
  grid,
  bestSlots,
  finalizedSlot
}: ResultBoardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const groupedByDate = Array.from(
    grid.reduce((map, item) => {
      const items = map.get(item.dateKey) ?? [];
      items.push(item);
      map.set(item.dateKey, items);
      return map;
    }, new Map<string, GridItem[]>())
  );

  function getCellTone(item: GridItem) {
    if (item.isAllAvailable) {
      return "border-amber-200 bg-[var(--all)]";
    }
    if (bestSlots.some((slot) => slot.key === item.key)) {
      return "border-yellow-200 bg-[var(--best)]";
    }
    if (item.availableCount > 0) {
      return "border-emerald-100 bg-[var(--ok-soft)]";
    }
    return "border-[var(--line)] bg-white";
  }

  function handleFinalize(item: GridItem) {
    startTransition(async () => {
      const response = await fetch(`/api/events/${token}/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: item.dateKey,
          slotKey: item.slotKey
        })
      });

      const result = (await response.json()) as FinalizeResponse;

      if (!result.ok) {
        window.alert(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="space-y-4">
      {finalizedSlot ? (
        <div className="card rounded-[28px] border-amber-200 bg-[var(--all)] p-5">
          <p className="text-sm font-medium text-[var(--primary-deep)]">最终确定时间</p>
          <p className="mt-2 text-2xl font-semibold">
            {finalizedSlot.dateLabel} · {finalizedSlot.slotLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">{finalizedSlot.slotTime}</p>
        </div>
      ) : null}

      <div className="card rounded-[28px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">当前汇总</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              已有 {participantCount} 位朋友填写。颜色越深，表示越多人有空。
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {participants.length > 0 ? (
            participants.map((participant) => (
              <span
                key={participant.id}
                className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-sm text-[var(--foreground)]"
              >
                {participant.nickname}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-white px-3 py-1.5 text-sm text-[var(--muted)]">还没人填写</span>
          )}
        </div>
      </div>

      {grid.every((item) => item.availableCount === 0) ? (
        <EmptyState
          title="还没有可用时间数据"
          description="等第一位朋友提交之后，这里会自动出现最合适的聚会时间。"
        />
      ) : (
        <div className="space-y-4">
          <div className="card rounded-[28px] p-5">
            <h3 className="text-lg font-semibold">推荐时间</h3>
            <div className="mt-4 space-y-3">
              {bestSlots.map((slot) => (
                <div
                  key={slot.key}
                  className={cn(
                    "rounded-3xl border px-4 py-4",
                    slot.isAllAvailable ? "border-amber-200 bg-[var(--all)]" : "border-yellow-200 bg-[var(--best)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">
                        {slot.dateLabel} · {slot.slotLabel}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{slot.slotTime}</p>
                      <p className="mt-2 text-sm">
                        {slot.isAllAvailable
                          ? `所有人都有空，共 ${slot.availableCount} 人`
                          : `目前最多 ${slot.availableCount} 人有空`}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleFinalize(slot)}
                      className="shrink-0 rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                      设为最终时间
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card rounded-[28px] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">时间统计表</h3>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="rounded-full bg-[var(--all)] px-3 py-1.5">全部可参加</span>
                <span className="rounded-full bg-[var(--best)] px-3 py-1.5">当前最优</span>
                <span className="rounded-full bg-[var(--ok-soft)] px-3 py-1.5">部分可参加</span>
              </div>
            </div>

            <div className="space-y-3">
              {groupedByDate.map(([dateKey, items]) => (
                <div key={dateKey} className="rounded-3xl border border-[var(--line)] bg-white/80 p-3">
                  <div className="mb-3 text-sm font-semibold">{items[0]?.dateLabel}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {SLOT_CONFIG.map((slot) => {
                      const item = items.find((entry) => entry.slotKey === slot.key);
                      if (!item) {
                        return null;
                      }

                      const isFinalized = finalizedSlot?.key === item.key;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => handleFinalize(item)}
                          disabled={isPending}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-left transition",
                            getCellTone(item),
                            isFinalized ? "ring-2 ring-[var(--primary)]" : ""
                          )}
                        >
                          <span className="block text-sm font-semibold">
                            {item.slotLabel}
                            {isFinalized ? " · 已确认" : ""}
                          </span>
                          <span className="mt-1 block text-xs text-[var(--muted)]">{item.slotTime}</span>
                          <span className="mt-3 block text-sm">
                            {item.availableCount} / {participantCount || 0} 人
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
