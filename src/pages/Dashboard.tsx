import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, RefreshCw, PackageOpen, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, errorMessage } from "../lib/api";
import { naira, compactNaira, timeAgo, STATUS } from "../lib/format";
import { useAuthStore } from "../lib/authStore";
import { cssColor } from "../lib/theme";
import { Button, Skeleton, StatusBadge, EmptyState } from "../components/ui";

interface Overview {
  days: number;
  revenue: { allTime: number; window: number; previous: number; changePct: number };
  orders: { paidAllTime: number; window: number; byStatus: Record<string, number> };
  averageOrderValue: number;
  shippingPending?: number;
  products: { total: number; active: number; lowStock: { _id: string; name: string; stock: number; images: string[] }[] };
  categories: number;
  series: { date: string; revenue: number; orders: number }[];
  recentOrders: { _id: string; orderNumber: string; customer: { name: string }; total: number; status: string; createdAt: string }[];
  topProducts: { _id: string; name: string; image: string; qty: number; revenue: number }[];
}

const PERIODS = [7, 30, 90];
const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function Dashboard() {
  const [days, setDays] = useState(7);
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<Overview>({
    queryKey: ["overview", days],
    queryFn: async () => (await api.get(`/stats/overview?days=${days}`)).data,
    placeholderData: (p) => p,
  });

  const toPrepare = (data?.orders.byStatus.paid || 0) + (data?.orders.byStatus.processing || 0);
  const up = (data?.revenue.changePct ?? 0) >= 0;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">{greeting()}, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="mt-1 text-[15px] text-ink-muted">
            {data ? (toPrepare ? `${toPrepare} order${toPrepare > 1 ? "s" : ""} waiting to be prepared.` : "Nothing waiting to be prepared right now.") : "Loading your studio…"}
            {!!data?.shippingPending && (
              <Link to="/orders?status=paid" className="ml-2 font-semibold text-primary-700 hover:underline">{data.shippingPending} need a shipping fee.</Link>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-line bg-white p-1" role="tablist" aria-label="Period">
            {PERIODS.map((p) => (
              <button key={p} role="tab" aria-selected={days === p} onClick={() => setDays(p)} className="relative rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold">
                {days === p && <motion.span layoutId="period" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <span className={`relative ${days === p ? "text-white" : "text-ink-soft"}`}>{p} days</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} aria-label="Refresh" className="h-[38px]">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="card"><EmptyState icon={AlertTriangle} title="Couldn't load the overview" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} /></div>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            {/* Revenue panel */}
            <section className="card p-6">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-[14px] text-ink-muted">Revenue, last {days} days</p>
                  {isLoading ? <Skeleton className="mt-2 h-10 w-48" /> : (
                    <p className="mt-1 text-[38px] font-bold tracking-[-0.03em] tabular-nums">{naira(data!.revenue.window)}</p>
                  )}
                  {data && (
                    <p className={`mt-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold ${up ? "text-leaf" : "text-red-600"}`}>
                      {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {up ? "+" : ""}{data.revenue.changePct}% vs previous {days} days
                    </p>
                  )}
                </div>
                <dl className="grid grid-cols-3 gap-8">
                  {[
                    ["Paid orders", data?.orders.window],
                    ["Avg. order", data ? compactNaira(data.averageOrderValue) : undefined],
                    ["All-time", data ? compactNaira(data.revenue.allTime) : undefined],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-[13px] text-ink-muted">{k}</dt>
                      <dd className="mt-1 text-[20px] font-semibold tabular-nums">{v ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="h-[260px]">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data!.series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={cssColor("--gold-400")} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={cssColor("--gold-400")} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={cssColor("--line")} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: cssColor("--ink-muted"), fontSize: 12 }} tickFormatter={(d) => new Date(d).toLocaleDateString("en-NG", days > 7 ? { day: "numeric", month: "short" } : { weekday: "short" })} minTickGap={24} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: cssColor("--ink-muted"), fontSize: 12 }} tickFormatter={(v) => compactNaira(v)} width={56} />
                      <Tooltip
                        cursor={{ stroke: cssColor("--primary-600"), strokeDasharray: "4 4" }}
                        contentStyle={{ borderRadius: 12, border: `1px solid ${cssColor("--line")}`, boxShadow: "0 12px 30px -12px rgba(30,22,27,.25)", fontFamily: "inherit" }}
                        labelFormatter={(d: any) => new Date(d).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "short" })}
                        formatter={(v: any, k: any) => [k === "revenue" ? naira(Number(v)) : v, k === "revenue" ? "Revenue" : "Orders"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke={cssColor("--primary-600")} strokeWidth={2.5} fill="url(#rev)" activeDot={{ r: 5, fill: cssColor("--primary-600"), stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Pipeline */}
            <section className="card p-6">
              <p className="mb-5 text-[16px] font-semibold">Order pipeline</p>
              <ul className="flex flex-col gap-4">
                {["pending_payment", "paid", "processing", "out_for_delivery"].map((s) => {
                  const count = data?.orders.byStatus[s] || 0;
                  const max = Math.max(1, ...["pending_payment", "paid", "processing", "out_for_delivery"].map((k) => data?.orders.byStatus[k] || 0));
                  return (
                    <li key={s}>
                      <Link to={`/orders?status=${s}`} className="group block">
                        <div className="mb-1.5 flex items-center justify-between text-[14px]">
                          <span className="text-ink-soft group-hover:text-ink">{STATUS[s].label}</span>
                          <span className="font-semibold tabular-nums">{isLoading ? "–" : count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-canvas">
                          <motion.div className={`h-full rounded-full ${STATUS[s].dot}`} initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-[13.5px]">
                <div><p className="text-ink-muted">Delivered</p><p className="text-[18px] font-semibold tabular-nums">{data?.orders.byStatus.delivered ?? "–"}</p></div>
                <div><p className="text-ink-muted">Live products</p><p className="text-[18px] font-semibold tabular-nums">{data ? `${data.products.active}/${data.products.total}` : "–"}</p></div>
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between px-6 pb-3 pt-5">
                <p className="text-[16px] font-semibold">Latest orders</p>
                <Link to="/orders" className="text-[13.5px] font-semibold text-primary-700 hover:underline">All orders</Link>
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-2 px-6 pb-6">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-11" />)}</div>
              ) : !data!.recentOrders.length ? (
                <EmptyState icon={PackageOpen} title="No orders yet" body="When customers check out, their orders appear here." />
              ) : (
                <table className="w-full text-[14px]">
                  <tbody>
                    {data!.recentOrders.map((o) => (
                      <tr key={o._id} className="border-t border-line hover:bg-canvas">
                        <td className="px-6 py-3"><Link to={`/orders?open=${o._id}`} className="font-semibold tabular-nums hover:text-primary-700">{o.orderNumber}</Link></td>
                        <td className="hidden px-3 py-3 text-ink-soft sm:table-cell">{o.customer?.name}</td>
                        <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                        <td className="hidden px-3 py-3 text-ink-muted md:table-cell">{timeAgo(o.createdAt)}</td>
                        <td className="px-6 py-3 text-right font-semibold tabular-nums">{naira(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="card p-6">
              <p className="mb-4 text-[16px] font-semibold">Best sellers</p>
              {isLoading ? <Skeleton className="h-40" /> : !data!.topProducts.length ? (
                <p className="text-[14px] text-ink-muted">Sales will rank your products here.</p>
              ) : (
                <ol className="flex flex-col gap-3.5">
                  {data!.topProducts.map((p) => (
                    <li key={p._id} className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-11 w-11 rounded-xl bg-cream-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium">{p.name}</p>
                        <p className="text-[12.5px] text-ink-muted">{p.qty} sold</p>
                      </div>
                      <p className="text-[14px] font-semibold tabular-nums">{compactNaira(p.revenue)}</p>
                    </li>
                  ))}
                </ol>
              )}
              {!!data?.products.lowStock.length && (
                <div className="mt-6 rounded-xl bg-amber-50 p-4 text-[13.5px] text-amber-900">
                  <p className="mb-1 flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-4 w-4" /> Running low</p>
                  {data.products.lowStock.map((p) => <p key={p._id}>{p.name}: {p.stock} left</p>)}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
