import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="page-shell pb-4">
      <div className="flex items-center justify-between rounded-full border border-[var(--line)] bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
        <Link href="/" className="text-sm font-semibold tracking-[0.18em] text-[var(--primary-deep)]">
          约时间吧
        </Link>
        <nav className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-[var(--accent)]/70">
            首页
          </Link>
          <Link href="/create" className="rounded-full bg-[var(--primary)] px-4 py-1.5 font-medium text-white">
            创建活动
          </Link>
        </nav>
      </div>
    </header>
  );
}
