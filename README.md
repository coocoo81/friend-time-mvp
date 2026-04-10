# 约时间吧 MVP

一个基于 Next.js App Router、TypeScript、Tailwind CSS、Prisma 和 PostgreSQL 的轻量聚会约时间工具。

## 功能概览

- 创建活动并生成分享链接
- 朋友无需注册，输入昵称即可填写空闲时间
- 同一昵称再次进入时可载入并修改已有记录
- 自动统计每个日期和时段的可参与人数
- 高亮显示所有人都有空的时间，或当前最多人有空的时间
- 支持把某个时间标记为最终确定时间

## 技术栈

- Next.js 15 + App Router
- TypeScript
- Tailwind CSS v4
- Prisma
- PostgreSQL
- Zod
- date-fns

## 本地启动

1. 安装 Node.js 20 或更高版本
2. 安装依赖

```bash
npm install
```

3. 环境变量

项目在线上推荐使用 PostgreSQL（例如 Neon）。

本地开发时请自己准备一个 PostgreSQL 数据库，并把连接串写进 `.env`。

如果你想手动重建配置，也可以执行：

```bash
cp .env.example .env
```

4. 生成 Prisma Client 并同步数据库结构

```bash
npm run db:generate
npm run db:push
```

5. 启动开发服务器

```bash
npm run dev
```

6. 打开浏览器访问

```text
http://localhost:3000
```

## 关键页面

- `/` 首页
- `/create` 创建活动页
- `/event/[token]` 活动填写与结果汇总页

## 数据库说明

默认使用 PostgreSQL，推荐线上搭配 Vercel + Neon。

如需查看数据：

```bash
npm run db:studio
```

## 当前 MVP 的简化策略

- 不做登录注册
- 不做复杂权限控制，知道活动链接的人都可以设置最终时间
- 通过“活动内昵称唯一”来承载再次编辑能力
- 当前只提供固定 3 个时间段：上午、下午、晚上

## 后续可优化方向

- 增加活动时区支持
- 增加邀请管理和发起人权限
- 支持自定义时间段
- 为参与者增加本地持久身份标识，减少昵称误占用
- 增加复制分享链接和微信分享体验
- 增加更丰富的统计视图和提醒能力
