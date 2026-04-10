"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SLOT_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DateOption = {
  key: string;
  label: string;
};

type ExistingParticipant = {
  id: number;
  nickname: string;
  selectedKeys: string[];
};

type AvailabilityFormProps = {
  token: string;
  dates: DateOption[];
  existingParticipants: ExistingParticipant[];
  finalizedLabel?: string | null;
};

type LoadResponse =
  | { ok: true; participant: { nickname: string; selections: { date: string; slotKey: string }[] } | null }
  | { ok: false; message: string };

type SubmitResponse = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function AvailabilityForm({ token, dates, existingParticipants, finalizedLabel }: AvailabilityFormProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedNicknames = useMemo(
    () => new Set(existingParticipants.map((item) => item.nickname.toLowerCase())),
    [existingParticipants]
  );

  function toggleSelection(cellKey: string) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(cellKey)) {
        next.delete(cellKey);
      } else {
        next.add(cellKey);
      }
      return next;
    });
  }

  function resetMessages() {
    setNotice(null);
    setError(null);
  }

  async function loadExistingSelection(nextNickname: string) {
    const trimmed = nextNickname.trim();
    resetMessages();

    if (!trimmed) {
      setSelectedKeys(new Set());
      return;
    }

    try {
      const response = await fetch(
        `/api/events/${token}/participant?nickname=${encodeURIComponent(trimmed)}`,
        { method: "GET", cache: "no-store" }
      );
      const result = (await response.json()) as LoadResponse;

      if (!result.ok) {
        setError(result.message);
        return;
      }

      if (!result.participant) {
        setSelectedKeys(new Set());
        if (normalizedNicknames.has(trimmed.toLowerCase())) {
          setNotice("这个昵称已存在但暂时无法载入，请稍后重试或换一个昵称。");
        }
        return;
      }

      setSelectedKeys(new Set(result.participant.selections.map((item) => `${item.date}:${item.slotKey}`)));
      setNotice("已载入你之前提交的时间，可直接修改后重新提交。若不是你，请更换昵称。");
    } catch {
      setError("载入已有记录失败，请稍后重试。");
    }
  }

  async function handleSubmit() {
    startTransition(async () => {
      resetMessages();

      try {
        const response = await fetch(`/api/events/${token}/availability`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nickname,
            selections: [...selectedKeys].map((item) => {
              const [date, slotKey] = item.split(":");
              return { date, slotKey };
            })
          })
        });

        const result = (await response.json()) as SubmitResponse;

        if (!result.ok) {
          setError(result.fieldErrors?.nickname?.[0] ?? result.message);
          return;
        }

        setNotice(result.message);
        router.refresh();
      } catch {
        setError("提交失败，请稍后重试。");
      }
    });
  }

  return (
    <section className="card rounded-[28px] p-5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">填写你的可用时间</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          输入昵称后，直接点选你有空的日期和时段。再次打开链接时，输入同样昵称即可继续修改。
        </p>
      </div>

      {finalizedLabel ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-[var(--all)] px-4 py-3 text-sm text-[var(--foreground)]">
          当前已暂定时间：<span className="font-semibold">{finalizedLabel}</span>
        </div>
      ) : null}

      <div className="mb-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">你的昵称</span>
          <div className="flex gap-3">
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              onBlur={(event) => {
                void loadExistingSelection(event.target.value);
              }}
              placeholder="例如：小林"
              className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            />
            <button
              type="button"
              onClick={() => void loadExistingSelection(nickname)}
              className="shrink-0 rounded-full border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--muted)]"
            >
              载入记录
            </button>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        {dates.map((date) => (
          <div key={date.key} className="rounded-3xl border border-[var(--line)] bg-white/80 p-3">
            <div className="mb-3 text-sm font-semibold">{date.label}</div>
            <div className="grid grid-cols-3 gap-2">
              {SLOT_CONFIG.map((slot) => {
                const cellKey = `${date.key}:${slot.key}`;
                const active = selectedKeys.has(cellKey);

                return (
                  <button
                    key={cellKey}
                    type="button"
                    onClick={() => toggleSelection(cellKey)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-left transition",
                      active
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                        : "border-[var(--line)] bg-white text-[var(--foreground)]"
                    )}
                  >
                    <span className="block text-sm font-semibold">{slot.label}</span>
                    <span className={cn("mt-1 block text-xs", active ? "text-white/80" : "text-[var(--muted)]")}>
                      {slot.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm">
        <span className="text-[var(--muted)]">
          已选择 <span className="font-semibold text-[var(--foreground)]">{selectedKeys.size}</span> 个时间段
        </span>
        <button
          type="button"
          onClick={() => setSelectedKeys(new Set())}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-[var(--muted)]"
        >
          清空选择
        </button>
      </div>

      {notice ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="mt-5 w-full rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "提交中..." : "保存我的可用时间"}
      </button>
    </section>
  );
}
