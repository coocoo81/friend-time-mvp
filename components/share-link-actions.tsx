"use client";

import { useState } from "react";

type ShareLinkActionsProps = {
  shareUrl: string;
};

export function ShareLinkActions({ shareUrl }: ShareLinkActionsProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mt-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={copyLink}
        className="w-full rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)]"
      >
        {copied ? "已复制链接" : "复制分享链接"}
      </button>
      {copied ? <p className="text-sm text-emerald-700">链接已复制，发到群里就可以了。</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
