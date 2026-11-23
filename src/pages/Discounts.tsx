import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Percent, Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { naira, shortDate } from "../lib/format";
import { Button, Drawer, EmptyState, Field, PageHeader, Pill, Skeleton, Toggle, useConfirm } from "../components/ui";

interface Discount {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  isActive: boolean;
  isVisible: boolean;
  headline?: string;
  description?: string;
  minSubtotal: number;
  firstOrderOnly: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  maxUses?: number | null;
  usedCount: number;
  label: string;
  live: boolean;
}

type Form = {
  code: string; type: "percent" | "fixed"; value: string; isActive: boolean; isVisible: boolean;
  headline: string; description: string; minSubtotal: string; firstOrderOnly: boolean; startsAt: string; endsAt: string; maxUses: string;
};
const blank: Form = { code: "", type: "percent", value: "10", isActive: true, isVisible: false, headline: "", description: "", minSubtotal: "", firstOrderOnly: false, startsAt: "", endsAt: "", maxUses: "" };
const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function Discounts() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [drawer, setDrawer] = useState<{ open: boolean; editing: Discount | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Form>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data = [], isLoading, isError, error, refetch } = useQuery<Discount[]>({
    queryKey: ["discounts"],
    queryFn: async () => (await api.get("/discounts")).data,
  });
  const visible = data.find((d) => d.isVisible);

  const open = (d: Discount | null) => {
    setErrors({});
    setForm(
      d
        ? { code: d.code, type: d.type, value: String(d.value), isActive: d.isActive, isVisible: d.isVisible, headline: d.headline || "", description: d.description || "", minSubtotal: d.minSubtotal ? String(d.minSubtotal) : "", firstOrderOnly: d.firstOrderOnly, startsAt: toDateInput(d.startsAt), endsAt: toDateInput(d.endsAt), maxUses: d.maxUses ? String(d.maxUses) : "" }
        : blank
    );
    setDrawer({ open: true, editing: d });
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["discounts"] });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        value: Number(form.value),
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt ? `${form.endsAt}T23:59:59` : null,
      };
      return drawer.editing ? api.put(`/discounts/${drawer.editing._id}`, body) : api.post("/discounts", body);
    },
    onSuccess: (res) => {
      toast.success(msg(res, "Discount saved"));
      invalidate();
      setDrawer({ open: false, editing: null });
    },
    onError: (e) => {
      setErrors(fieldErrors(e));
      toast.error(errorMessage(e, "Couldn't save the discount."));
    },
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Discount> }) => api.put(`/discounts/${id}`, body),
    onSuccess: (res) => {
      toast.success(msg(res, "Updated"));
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't update the discount.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/discounts/${id}`),
    onSuccess: (res) => {
      toast.success(msg(res, "Deleted"));
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const set = <K extends keyof Form>(k: K, val: Form[K]) => setForm((f) => ({ ...f, [k]: val }));
  const preview = form.type === "percent" ? `${form.value || 0}% off` : `${naira(Number(form.value) || 0)} off`;

  return (
    <div>
      <PageHeader
        title="Discounts"
        sub="Create promo codes, set exactly how much they take off, and choose which one is advertised on the website."
        actions={<Button onClick={() => open(null)}><Plus className="h-4 w-4" /> New discount</Button>}
      />

      {/* What's on the site right now */}
      <div className={`card mb-5 flex flex-wrap items-center gap-4 p-5 ${visible ? "border-gold-300 bg-gold-50" : ""}`}>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${visible ? "bg-gold-400 text-ink" : "bg-cream-100 text-ink-muted"}`}>
          {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{visible ? `Showing on the website: ${visible.code} (${visible.label})` : "No discount is showing on the website"}</p>
          <p className="text-[13.5px] text-ink-muted">
            {visible
              ? visible.live
                ? "Visitors see it in the announcement bar and a popup that collects their email."
                : "It's switched on for the website but isn't live (turned off, expired or used up), so visitors won't see it."
              : "Switch “Show on website” on for any discount to advertise it in the popup and announcement bar."}
          </p>
        </div>
        {visible && <Button variant="ghost" size="sm" onClick={() => patch.mutate({ id: visible._id, body: { isVisible: false } })}>Hide from website</Button>}
      </div>

      <div className="card overflow-hidden">
        {isError ? (
          <EmptyState icon={Percent} title="Couldn't load discounts" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className="flex flex-col gap-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : !data.length ? (
          <EmptyState icon={Percent} title="No discounts yet" body="Create a code like LOVE10 and decide whether it's advertised on the site." action={<Button onClick={() => open(null)}><Plus className="h-4 w-4" /> New discount</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[14px]">
              <thead>
                <tr className="text-left text-[12.5px] text-ink-muted">
                  <th className="px-5 py-3 font-medium">Code</th>
                  <th className="px-3 py-3 font-medium">Discount</th>
                  <th className="px-3 py-3 font-medium">Rules</th>
                  <th className="px-3 py-3 font-medium">Used</th>
                  <th className="px-3 py-3 font-medium">Can be used</th>
                  <th className="px-3 py-3 font-medium">Show on website</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d._id} className="border-t border-line hover:bg-cream-50">
                    <td className="px-5 py-3.5">
                      <button onClick={() => { navigator.clipboard?.writeText(d.code); toast.success(`${d.code} copied`); }} className="group flex items-center gap-2 font-semibold tracking-wide" title="Copy code">
                        {d.code} <Copy className="h-3.5 w-3.5 text-ink-muted opacity-0 group-hover:opacity-100" />
                      </button>
                      {!d.live && d.isActive && <span className="text-[12px] text-amber-700">Not live (dates or limit)</span>}
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-primary-700">{d.label}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {d.firstOrderOnly && <Pill>First order</Pill>}
                        {d.minSubtotal > 0 && <Pill tone="zinc">Over {naira(d.minSubtotal)}</Pill>}
                        {d.endsAt && <Pill tone="zinc">Ends {shortDate(d.endsAt)}</Pill>}
                        {!d.firstOrderOnly && !d.minSubtotal && !d.endsAt && <span className="text-ink-muted">Any order</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">{d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ""}</td>
                    <td className="px-3 py-3.5"><Toggle label={`Allow ${d.code} at checkout`} checked={d.isActive} onChange={(val) => patch.mutate({ id: d._id, body: { isActive: val } })} /></td>
                    <td className="px-3 py-3.5"><Toggle label={`Show ${d.code} on website`} checked={d.isVisible} onChange={(val) => patch.mutate({ id: d._id, body: { isVisible: val } })} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => open(d)} className="rounded-lg p-2 text-ink-muted hover:bg-cream-100 hover:text-ink" aria-label={`Edit ${d.code}`}><Pencil className="h-4 w-4" /></button>
                        <button
                          onClick={async () => (await confirm({ title: `Delete ${d.code}?`, body: "Customers won't be able to use it any more. Past orders keep their discount.", confirmLabel: "Delete", danger: true })) && remove.mutate(d._id)}
                          className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${d.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, editing: null })}
        title={drawer.editing ? `Edit ${drawer.editing.code}` : "New discount"}
        sub={`Customers get ${preview}`}
        footer={<><Button variant="ghost" onClick={() => setDrawer({ open: false, editing: null })}>Cancel</Button><Button onClick={() => save.mutate()} loading={save.isPending}>{drawer.editing ? "Save changes" : "Create discount"}</Button></>}
      >
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="flex flex-col gap-5">
          <Field label="Code" htmlFor="code" error={errors.code} hint="What customers type at checkout. Letters and numbers, no spaces.">
            <input id="code" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="LOVE10" className={`input font-semibold tracking-wide ${errors.code ? "input-error" : ""}`} />
          </Field>

          <div>
            <p className="label">Discount</p>
            <div className="flex gap-2">
              <div className="flex rounded-xl border border-line p-1 text-[13.5px]">
                {(["percent", "fixed"] as const).map((t) => (
                  <button type="button" key={t} onClick={() => set("type", t)} className={`rounded-lg px-3 py-1.5 font-medium ${form.type === t ? "bg-ink text-white" : "text-ink-soft"}`}>{t === "percent" ? "% off" : "₦ off"}</button>
                ))}
              </div>
              <div className="relative flex-1">
                <input type="number" min={1} max={form.type === "percent" ? 100 : undefined} value={form.value} onChange={(e) => set("value", e.target.value)} className={`input pr-10 ${errors.value ? "input-error" : ""}`} aria-label="Discount amount" />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted">{form.type === "percent" ? "%" : "₦"}</span>
              </div>
            </div>
            {errors.value && <p className="mt-1.5 text-[13px] font-medium text-red-600">{errors.value}</p>}
          </div>

          <section className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            <div className="flex items-center justify-between gap-4 p-4">
              <div><p className="text-[14px] font-semibold">Can be used at checkout</p><p className="text-[12.5px] text-ink-muted">Turn off to pause the code without deleting it.</p></div>
              <Toggle label="Can be used at checkout" checked={form.isActive} onChange={(val) => set("isActive", val)} />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <div><p className="text-[14px] font-semibold">Show on website</p><p className="text-[12.5px] text-ink-muted">Advertise it in the popup and announcement bar. Only one discount shows at a time.</p></div>
              <Toggle label="Show on website" checked={form.isVisible} onChange={(val) => set("isVisible", val)} />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <div><p className="text-[14px] font-semibold">First order only</p><p className="text-[12.5px] text-ink-muted">Checked against the customer's email at checkout.</p></div>
              <Toggle label="First order only" checked={form.firstOrderOnly} onChange={(val) => set("firstOrderOnly", val)} />
            </div>
          </section>

          {form.isVisible && (
            <section className="flex flex-col gap-4 rounded-2xl bg-gold-50 p-4">
              <p className="text-[14px] font-semibold">Popup wording</p>
              <Field label="Headline" htmlFor="headline" hint={`Leave blank for “Enjoy ${preview} your first order”.`}>
                <input id="headline" maxLength={80} value={form.headline} onChange={(e) => set("headline", e.target.value)} className="input" />
              </Field>
              <Field label="Supporting line" htmlFor="description">
                <input id="description" maxLength={200} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="And be the first to hear about new boxes and seasonal drops." className="input" />
              </Field>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Minimum order (₦)" htmlFor="min" hint="Optional"><input id="min" type="number" min={0} value={form.minSubtotal} onChange={(e) => set("minSubtotal", e.target.value)} className="input" /></Field>
            <Field label="Total uses allowed" htmlFor="max" hint="Optional — blank for unlimited"><input id="max" type="number" min={1} value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} className="input" /></Field>
            <Field label="Starts" htmlFor="starts"><input id="starts" type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} className="input" /></Field>
            <Field label="Ends" htmlFor="ends" error={errors.endsAt}><input id="ends" type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} className={`input ${errors.endsAt ? "input-error" : ""}`} /></Field>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
