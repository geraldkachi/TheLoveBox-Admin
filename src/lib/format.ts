export const naira = (n: number) => "₦" + Math.round(n || 0).toLocaleString("en-NG");
export const compactNaira = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m` : n >= 1000 ? `₦${Math.round(n / 1000)}k` : naira(n);
export const dateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const shortDate = (d: string | Date) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
export const timeAgo = (d: string | Date) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const STATUS: Record<string, { label: string; tone: string; dot: string }> = {
  pending_payment: { label: "Awaiting payment", tone: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  paid: { label: "Paid", tone: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  processing: { label: "Being styled", tone: "bg-sky-50 text-sky-800 ring-sky-200", dot: "bg-sky-500" },
  out_for_delivery: { label: "Out for delivery", tone: "bg-violet-50 text-violet-800 ring-violet-200", dot: "bg-violet-500" },
  delivered: { label: "Delivered", tone: "bg-zinc-100 text-zinc-700 ring-zinc-200", dot: "bg-zinc-500" },
  cancelled: { label: "Cancelled", tone: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
};
export const STATUS_ORDER = ["pending_payment", "paid", "processing", "out_for_delivery", "delivered", "cancelled"];
