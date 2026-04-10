"use client";

import { useState, useTransition } from "react";

type ShareLinkActionsProps = {
  shareUrl: string;
  title: string;
};

export function ShareLinkActions({ shareUrl, title }: ShareLinkActionsProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function copyLink() {
    setError(null);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("复制失败，请手动长按链接复制。");
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        await navigator.share({
          title,
          text: `来一起选时间：${title}`,
          url: shareUrl
        });
      } catch {
        // User cancelled share dialog; no need to show an error.
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)]"
      >
        {copied ? "已复制链接" : "复制分享链接"}
      </button>
      <button
        type="button"
        onClick={shareLink}
        disabled={isPending}
        className="rounded-full border border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--foreground)] disabled:opacity-60"
      >
        手机系统分享
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
