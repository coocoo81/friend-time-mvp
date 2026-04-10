import Link from "next/link";
import { CalendarRange, Users, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const features = [
  {
    icon: CalendarRange,
    title: "发起活动超简单",
    description: "只需要填活动名称和日期范围，系统自动生成分享链接。"
  },
  {
    icon: Users,
    title: "朋友无需注册",
    description: "打开链接输入昵称，直接勾选有空的日期和时间段。"
  },
  {
    icon: Sparkles,
    title: "自动找出最佳时间",
    description: "优先展示所有人都能参加的时间，没有完全重合时也会给出最优解。"
  }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell pt-2">
        <section className="card soft-grid overflow-hidden rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-medium text-[var(--primary-deep)]">
              为 3 到 20 人的小聚会准备
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              把“什么时候都有空？”
              <br />
              变成一次轻松的勾选
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)] sm:text-lg">
              创建一个活动，把链接发到群里。朋友们不用登录，打开就能填写自己的空闲时间，页面会自动汇总出最适合大家的聚会时段。
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="rounded-full bg-[var(--primary)] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--primary-deep)]"
              >
                立即创建活动
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-[var(--line)] bg-white/80 px-6 py-3 text-center text-sm font-medium text-[var(--foreground)]"
              >
                先看看怎么用
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card rounded-[28px] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--primary-deep)]">
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-lg font-semibold">{feature.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section id="how-it-works" className="mt-6 card rounded-[32px] p-6">
          <h2 className="text-2xl font-semibold">三步完成约时间</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "创建活动", "设置活动名称和候选日期范围。"],
              ["2", "分享链接", "朋友打开链接输入昵称后直接勾选。"],
              ["3", "确认时间", "系统自动算出最佳时段，一键确认。"]
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-3xl border border-[var(--line)] bg-white/70 p-5">
                <div className="text-sm font-semibold text-[var(--primary-deep)]">STEP {step}</div>
                <p className="mt-3 text-lg font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
