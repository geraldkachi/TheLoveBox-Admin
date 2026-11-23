import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, PackageOpen, Phone, Mail, MapPin, Gift, Trash2, Copy, CalendarDays, Truck, Send } from "lucide-react";
import { api, errorMessage, msg } from "../lib/api";
import { naira, dateTime, shortDate, STATUS, STATUS_ORDER } from "../lib/format";
import { useAuthStore } from "../lib/authStore";
import type { Order, Paged } from "../lib/types";
import { Button, Drawer, EmptyState, PageHeader, Pill, Skeleton, StatusBadge, Toggle, useConfirm, useDebounced } from "../components/ui";

const LIMIT = 15;

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const page = Number(params.get("page") || 1);
  const openId = params.get("open");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    if (k !== "page" && k !== "open") next.delete("page");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (q) setParam("page");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const { data, isLoading, isError, error, refetch } = useQuery<Paged<Order>>({
    queryKey: ["orders", status, page, q],
    queryFn: async () => (await api.get("/orders", { params: { status: status || undefined, page, limit: LIMIT, search: q || undefined } })).data,
    placeholderData: (p) => p,
  });

  const counts = data?.statusCounts || {};
  const all = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader title="Orders" sub="Update statuses as gifts move from the studio to the door. Customers see every change on their tracking page." />

      <div className="mb-4 flex gap-1 overflow-x-auto pb-1 no-scrollbar" role="tablist">
        {[{ key: "", label: "All", count: all }, ...STATUS_ORDER.map((s) => ({ key: s, label: STATUS[s].label, count: counts[s] || 0 }))].map((t) => (
          <button key={t.key || "all"} role="tab" aria-selected={status === t.key} onClick={() => setParam("status", t.key)} className="relative shrink-0 rounded-xl px-3.5 py-2 text-[14px] font-medium">
            {status === t.key && <motion.span layoutId="order-tab" className="absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-line" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <span className={`relative flex items-center gap-2 ${status === t.key ? "text-ink" : "text-ink-muted hover:text-ink"}`}>
              {t.label}
              <span className={`rounded-md px-1.5 text-[12px] tabular-nums ${status === t.key ? "bg-cream-100 text-primary-700" : "bg-line/70"}`}>{t.count}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number, name, email or phone" className="input pl-9" aria-label="Search orders" />
          </div>
        </div>

        {isError ? (
          <EmptyState icon={PackageOpen} title="Couldn't load orders" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className="flex flex-col gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon={PackageOpen} title={q || status ? "No orders match" : "No orders yet"} body={q || status ? "Try a different search or status." : "New orders show up here the moment a customer checks out."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[14px]">
              <thead>
                <tr className="text-left text-[12.5px] text-ink-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Placed</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((o) => (
                  <tr key={o._id} onClick={() => setParam("open", o._id)} className="cursor-pointer border-t border-line transition-colors hover:bg-cream-50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold tabular-nums">{o.orderNumber}</p>
                      <p className="text-[12.5px] text-ink-muted">{o.items.length} item{o.items.length > 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-[12.5px] text-ink-muted">{o.customer.phone}</p>
                    </td>
                    <td className="px-3 py-3.5 text-ink-soft">{dateTime(o.createdAt)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="font-semibold tabular-nums">{naira(o.total)}</p>
                      {o.status !== "pending_payment" && o.status !== "cancelled" && o.shipping?.status === "pending_quote" && <p className="text-[12px] font-medium text-amber-700">Set shipping</p>}
                      {o.shipping?.status === "awaiting_payment" && <p className="text-[12px] text-ink-muted">Shipping unpaid</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13.5px] text-ink-muted">
            <span>Page {data.page} of {data.pages}, {data.total} orders</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled={page >= data.pages} onClick={() => setParam("page", String(page + 1))} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <OrderDrawer id={openId} onClose={() => setParam("open")} />
    </div>
  );
}

function OrderDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [fee, setFee] = useState("");
  const [feeNote, setFeeNote] = useState("");

  const { data: order, isLoading, isError, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
    enabled: !!id,
  });

  useEffect(() => {
    if (order) {
      setNextStatus(order.status);
      setFee(order.shipping?.fee ? String(order.shipping.fee) : "");
      setFeeNote(order.shipping?.note || "");
    }
    setNote("");
  }, [order]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["orders"] });
    qc.invalidateQueries({ queryKey: ["order", id] });
  };

  const shipping = useMutation({
    mutationFn: (waive: boolean) => api.patch(`/orders/${id}/shipping`, waive ? { waive: true, note: feeNote || undefined } : { fee: Number(fee), note: feeNote || undefined, notify: true }),
    onSuccess: (res) => {
      toast.success(msg(res, "Shipping saved"));
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't save the shipping fee.")),
  });

  const resend = useMutation({
    mutationFn: (type: "receipt" | "shipping" | "status") => api.post(`/orders/${id}/resend-email`, { type }),
    onSuccess: (res) => toast.success(msg(res, "Email sent")),
    onError: (e) => toast.error(errorMessage(e, "The email couldn't be sent.")),
  });

  const update = useMutation({
    mutationFn: () => api.patch(`/orders/${id}/status`, { status: nextStatus, note: note.trim() || undefined, notify }),
    onSuccess: (res) => {
      toast.success(msg(res, "Order updated"));
      setNote("");
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't update the order.")),
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/orders/${id}`),
    onSuccess: (res) => {
      toast.success(msg(res, "Order deleted"));
      qc.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't delete the order.")),
  });

  const askDelete = async () => {
    if (await confirm({ title: `Delete ${order?.orderNumber}?`, body: "The customer will no longer be able to track it. This can't be undone.", confirmLabel: "Delete order", danger: true })) remove.mutate();
  };

  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      title={order?.orderNumber || "Order"}
      sub={order ? `Placed ${dateTime(order.createdAt)}` : undefined}
      footer={
        order && isAdmin ? (
          <Button variant="subtle" onClick={askDelete} loading={remove.isPending} className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" /> Delete order
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : isError ? (
        <p className="text-red-600">{errorMessage(error)}</p>
      ) : order ? (
        <div className="flex flex-col gap-7">
          {/* Status control */}
          <section className="rounded-2xl bg-cream-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[14px] font-semibold">Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button key={s} onClick={() => setNextStatus(s)} className={`rounded-lg px-2.5 py-1.5 text-[13px] font-medium ring-1 ring-inset transition ${nextStatus === s ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-line hover:ring-ink/30"}`}>
                  {STATUS[s].label}
                </button>
              ))}
            </div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the customer (optional), e.g. Rider: Musa, 0803…" className="input mt-3" maxLength={300} />
            {["processing", "out_for_delivery", "delivered", "cancelled"].includes(nextStatus) && nextStatus !== order.status && (
              <label className="mt-3 flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                <Toggle label="Email the customer" checked={notify} onChange={setNotify} /> Email the customer about this update
              </label>
            )}
            <Button className="mt-3 w-full" onClick={() => update.mutate()} loading={update.isPending} disabled={nextStatus === order.status && !note.trim()}>
              {nextStatus === order.status ? "Add note" : `Mark as ${STATUS[nextStatus]?.label.toLowerCase()}`}
            </Button>
          </section>

          {/* Shipping */}
          {order.status !== "pending_payment" && order.status !== "cancelled" && (
            <section className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[14px] font-semibold"><Truck className="h-4 w-4 text-primary-600" /> Shipping</p>
                {order.shipping?.status === "paid" ? <Pill tone="green">Paid</Pill> : order.shipping?.status === "awaiting_payment" ? <Pill>Awaiting payment</Pill> : order.shipping?.status === "waived" ? <Pill tone="green">Waived</Pill> : <Pill tone="zinc">Needs a fee</Pill>}
              </div>
              {order.shipping?.status === "paid" || order.shipping?.status === "waived" ? (
                <p className="text-[14px] text-ink-soft">
                  {order.shipping.status === "paid" ? `${naira(order.shipping.fee || 0)} paid ${order.shipping.paidAt ? dateTime(order.shipping.paidAt) : ""}.` : "Delivery is free for this order."}
                </p>
              ) : (
                <>
                  <p className="mb-3 text-[13px] text-ink-muted">
                    {order.shipping?.status === "awaiting_payment"
                      ? "The customer has a payment link. Change the fee to send an updated one."
                      : "Enter the delivery fee. The customer gets an email with a Paystack link to pay it."}
                  </p>
                  <div className="flex gap-2">
                    <div className="relative w-36 shrink-0">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₦</span>
                      <input type="number" min={1} value={fee} onChange={(e) => setFee(e.target.value)} placeholder="4500" className="input pl-7" aria-label="Shipping fee" />
                    </div>
                    <input value={feeNote} onChange={(e) => setFeeNote(e.target.value)} maxLength={200} placeholder="Note, e.g. Yaba → Lekki, same day" className="input" aria-label="Shipping note" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => shipping.mutate(false)} loading={shipping.isPending} disabled={!(Number(fee) > 0)}>
                      <Send className="h-3.5 w-3.5" /> {order.shipping?.status === "awaiting_payment" ? "Update & resend" : "Send fee to customer"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => (await confirm({ title: "Make delivery free?", body: "The customer won't be asked to pay for shipping on this order." , confirmLabel: "Waive shipping" })) && shipping.mutate(true)}>Waive shipping</Button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Customer */}
          <section>
            <p className="mb-3 text-[14px] font-semibold">Customer</p>
            <ul className="flex flex-col gap-2.5 text-[14px]">
              <li className="font-medium">{order.customer.name}</li>
              <li className="flex items-center gap-2 text-ink-soft"><Phone className="h-4 w-4 text-ink-muted" /><a href={`tel:${order.customer.phone}`} className="hover:underline">{order.customer.phone}</a></li>
              <li className="flex items-center gap-2 text-ink-soft"><Mail className="h-4 w-4 text-ink-muted" /><a href={`mailto:${order.customer.email}`} className="hover:underline">{order.customer.email}</a></li>
              <li className="flex items-start gap-2 text-ink-soft">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                <span className="flex-1">{order.deliveryAddress}</span>
                <button onClick={() => { navigator.clipboard?.writeText(order.deliveryAddress); toast.success("Address copied"); }} className="rounded-md p-1 hover:bg-cream-100" aria-label="Copy address"><Copy className="h-3.5 w-3.5" /></button>
              </li>
              {order.deliveryDate && <li className="flex items-center gap-2 text-ink-soft"><CalendarDays className="h-4 w-4 text-ink-muted" />Deliver on {shortDate(order.deliveryDate)}</li>}
            </ul>
            {order.giftMessage && (
              <div className="mt-4 rounded-xl border border-dashed border-gold-300 bg-white p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-primary-700"><Gift className="h-3.5 w-3.5" /> Card message</p>
                <p className="font-script text-[28px] leading-tight">{order.giftMessage}</p>
              </div>
            )}
          </section>

          {/* Items */}
          <section>
            <p className="mb-3 text-[14px] font-semibold">Items</p>
            <ul className="flex flex-col gap-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3">
                  <img src={it.image || "/brand/logo-mark.png"} alt="" className="h-14 w-12 rounded-lg bg-cream-100 object-cover" />
                  <div className="min-w-0 flex-1 text-[14px]">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-ink-muted">{it.size !== "Standard" ? `${it.size}, ` : ""}{it.qty} × {naira(it.price)}</p>
                    {it.kind === "custom" && it.components && (
                      <ul className="mt-1.5 rounded-lg bg-canvas px-3 py-2 text-[12.5px] text-ink-soft">
                        {it.components.map((c, j) => (
                          <li key={j} className="flex justify-between gap-3"><span>{c.step === "box" ? "Box: " : ""}{c.name}{c.qty > 1 ? ` ×${c.qty}` : ""}</span><span className="tabular-nums">{naira(c.price * c.qty)}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-[14px] font-semibold tabular-nums">{naira(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd className="tabular-nums">{naira(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Shipping</dt><dd className="tabular-nums">{order.shipping?.fee ? `${naira(order.shipping.fee)} (billed separately)` : order.shipping?.status === "waived" ? "Free" : "Not set yet"}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-leaf"><dt>Discount {order.promoCode && `(${order.promoCode})`}</dt><dd className="tabular-nums">−{naira(order.discount)}</dd></div>}
              <div className="flex justify-between pt-1 text-[16px] font-semibold"><dt>Total</dt><dd className="tabular-nums">{naira(order.total)}</dd></div>
              {order.paystackReference && <div className="flex justify-between text-[12.5px] text-ink-muted"><dt>Paystack ref</dt><dd className="tabular-nums">{order.paystackReference}</dd></div>}
            </dl>
          </section>

          {/* Emails */}
          {order.status !== "pending_payment" && (
            <section>
              <p className="mb-2 text-[14px] font-semibold">Emails</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => resend.mutate("receipt")} loading={resend.isPending && resend.variables === "receipt"}><Mail className="h-3.5 w-3.5" /> Resend receipt</Button>
                {order.shipping?.status === "awaiting_payment" && <Button size="sm" variant="ghost" onClick={() => resend.mutate("shipping")} loading={resend.isPending && resend.variables === "shipping"}><Truck className="h-3.5 w-3.5" /> Resend shipping link</Button>}
                {["processing", "out_for_delivery", "delivered", "cancelled"].includes(order.status) && <Button size="sm" variant="ghost" onClick={() => resend.mutate("status")} loading={resend.isPending && resend.variables === "status"}><Send className="h-3.5 w-3.5" /> Resend status update</Button>}
              </div>
            </section>
          )}

          {/* Timeline */}
          <section>
            <p className="mb-3 text-[14px] font-semibold">History</p>
            <ol className="relative ml-1.5 border-l border-line">
              {[...order.trackingHistory].reverse().map((h, i) => (
                <li key={i} className="mb-4 ml-5 last:mb-0">
                  <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? "bg-primary-600" : "bg-zinc-300"}`} />
                  <p className="text-[14px] font-medium">{h.note || STATUS[h.status]?.label || h.status}</p>
                  <p className="text-[12.5px] text-ink-muted">{STATUS[h.status]?.label}, {dateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </Drawer>
  );
}
