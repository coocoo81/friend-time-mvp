"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CreateResponse =
  | { ok: true; token: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? "")
    };

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json()) as CreateResponse;

      if (!result.ok) {
        setError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      router.push(`/event/${result.token}`);
      router.refresh();
    } catch {
      setError("创建活动失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card soft-grid rounded-[32px] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mb-6">
        <p className="text-2xl font-semibold">创建一个新的聚会活动</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          先定义候选日期范围，朋友们打开链接后直接勾选自己有空的时间段。
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">活动名称</span>
          <input
            name="title"
            placeholder="例如：周末一起吃火锅"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none ring-0 transition focus:border-[var(--primary)]"
          />
          {fieldErrors.title?.[0] ? <p className="mt-2 text-sm text-red-500">{fieldErrors.title[0]}</p> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">活动说明</span>
          <textarea
            name="description"
            rows={4}
            placeholder="例如：想约大家在 4 月中旬找一天晚上聚一下"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
          {fieldErrors.description?.[0] ? (
            <p className="mt-2 text-sm text-red-500">{fieldErrors.description[0]}</p>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">开始日期</span>
            <input
              type="date"
              name="startDate"
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            />
            {fieldErrors.startDate?.[0] ? (
              <p className="mt-2 text-sm text-red-500">{fieldErrors.startDate[0]}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">结束日期</span>
            <input
              type="date"
              name="endDate"
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
            />
            {fieldErrors.endDate?.[0] ? (
              <p className="mt-2 text-sm text-red-500">{fieldErrors.endDate[0]}</p>
            ) : null}
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[var(--line)] bg-white/80 p-4">
        <p className="text-sm font-semibold">MVP 固定时间段</p>
        <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
          <div className="rounded-2xl bg-[var(--accent)]/60 px-4 py-3">上午 09:00 - 12:00</div>
          <div className="rounded-2xl bg-[var(--accent)]/60 px-4 py-3">下午 13:00 - 18:00</div>
          <div className="rounded-2xl bg-[var(--accent)]/60 px-4 py-3">晚上 18:00 - 22:00</div>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "创建中..." : "创建活动并生成链接"}
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--line)] px-5 py-3 text-center text-sm font-medium text-[var(--muted)]"
        >
          返回首页
        </Link>
      </div>
    </form>
  );
}
