import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell pt-2">
        <div className="card rounded-[32px] px-6 py-10 text-center">
          <h1 className="text-3xl font-semibold">活动不存在</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            这个活动链接可能已经失效，或者分享链接有误。
          </p>
          <Link
            href="/create"
            className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white"
          >
            去创建一个新活动
          </Link>
        </div>
      </main>
    </>
  );
}
