import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Package, Gift, Coffee, Pencil, Trash2, ImagePlus, X, ExternalLink } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { naira } from "../lib/format";
import { Button, Drawer, EmptyState, Field, PageHeader, Pill, Skeleton, Toggle, useConfirm } from "../components/ui";

type Step = "box" | "item" | "extra";
interface Option {
  _id: string;
  step: Step;
  name: string;
  description?: string;
  image?: string;
  price: number;
  group?: string;
  capacity?: number;
  maxPerOrder: number;
  stock?: number | null;
  isActive: boolean;
  order: number;
}

const TABS: { step: Step; label: string; icon: any; help: string; noun: string }[] = [
  { step: "box", label: "Gift boxes", icon: Package, help: "Step 1. Customers pick one box. Its capacity sets how many gift items fit inside.", noun: "box" },
  { step: "item", label: "Gift items", icon: Gift, help: "Step 2. Things that go inside the box. Each one uses a space.", noun: "gift item" },
  { step: "extra", label: "Food, drinks & cards", icon: Coffee, help: "Step 3. Optional extras. Group them (e.g. Drinks, Greeting cards) to organise the page.", noun: "extra" },
];
const SITE = import.meta.env.VITE_SITE_URL || "https://the-love-box-customer.vercel.app";

type Form = { name: string; description: string; price: string; group: string; capacity: string; maxPerOrder: string; stock: string; isActive: boolean; order: string };
const blank: Form = { name: "", description: "", price: "", group: "", capacity: "6", maxPerOrder: "5", stock: "", isActive: true, order: "0" };

export default function Curate() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [tab, setTab] = useState<Step>("box");
  const [drawer, setDrawer] = useState<{ open: boolean; editing: Option | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Form>(blank);
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data = [], isLoading, isError, error, refetch } = useQuery<Option[]>({
    queryKey: ["curate-options"],
    queryFn: async () => (await api.get("/curate/manage")).data,
  });
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.step, data.filter((o) => o.step === t.step).length])), [data]);
  const list = data.filter((o) => o.step === tab);
  const groups = Array.from(new Set(data.filter((o) => o.step === "extra" && o.group).map((o) => o.group!)));
  const current = TABS.find((t) => t.step === tab)!;
  const ready = data.some((o) => o.step === "box" && o.isActive) && data.some((o) => o.step === "item" && o.isActive);

  useEffect(() => () => { if (file) URL.revokeObjectURL(file.url); }, [file]);

  const open = (o: Option | null) => {
    setErrors({});
    setFile(null);
    setRemoveImage(false);
    setForm(
      o
        ? { name: o.name, description: o.description || "", price: String(o.price), group: o.group || "", capacity: String(o.capacity || 6), maxPerOrder: String(o.maxPerOrder || 5), stock: o.stock == null ? "" : String(o.stock), isActive: o.isActive, order: String(o.order || 0) }
        : { ...blank, group: tab === "extra" ? groups[0] || "" : "", maxPerOrder: tab === "box" ? "1" : "5" }
    );
    setDrawer({ open: true, editing: o });
  };

  const save = useMutation({
    mutationFn: () => {
      const step = drawer.editing?.step || tab;
      const fd = new FormData();
      fd.append("step", step);
      fd.append("name", form.name.trim());
      fd.append("description", form.description);
      fd.append("price", form.price || "0");
      if (step === "extra") fd.append("group", form.group.trim());
      if (step === "box") fd.append("capacity", form.capacity || "6");
      fd.append("maxPerOrder", step === "box" ? "1" : form.maxPerOrder || "5");
      fd.append("stock", form.stock === "" ? "null" : form.stock);
      fd.append("isActive", String(form.isActive));
      fd.append("order", form.order || "0");
      if (removeImage) fd.append("removeImage", "true");
      if (file) fd.append("image", file.file);
      return drawer.editing ? api.put(`/curate/manage/${drawer.editing._id}`, fd) : api.post("/curate/manage", fd);
    },
    onSuccess: (res) => {
      toast.success(msg(res, "Saved"));
      qc.invalidateQueries({ queryKey: ["curate-options"] });
      setDrawer({ open: false, editing: null });
    },
    onError: (e) => {
      setErrors(fieldErrors(e));
      toast.error(errorMessage(e, "Couldn't save."));
    },
  });

  const patch = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      const fd = new FormData();
      fd.append("isActive", String(isActive));
      return api.put(`/curate/manage/${id}`, fd);
    },
    onSuccess: (res) => {
      toast.success(msg(res, "Updated"));
      qc.invalidateQueries({ queryKey: ["curate-options"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/curate/manage/${id}`),
    onSuccess: (res) => {
      toast.success(msg(res, "Removed"));
      qc.invalidateQueries({ queryKey: ["curate-options"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const pickFile = (f?: File) => {
    if (!f) return;
    if (!/^image\/(jpe?g|png|webp)$/.test(f.type)) return void toast.error("Use a JPG, PNG or WEBP image.");
    if (f.size > 10 * 1024 * 1024) return void toast.error("Images must be 10MB or smaller.");
    setFile({ file: f, url: URL.createObjectURL(f) });
    setRemoveImage(false);
  };

  const set = <K extends keyof Form>(k: K, val: Form[K]) => setForm((f) => ({ ...f, [k]: val }));
  const step = drawer.editing?.step || tab;
  const previewImg = file?.url || (!removeImage ? drawer.editing?.image : undefined);

  return (
    <div>
      <PageHeader
        title="Curate a gift"
        sub="Everything customers can choose from when they build their own box."
        actions={
          <>
            <a href={`${SITE}/curate`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[14.5px] font-semibold hover:border-ink/30">
              <ExternalLink className="h-4 w-4" /> Preview builder
            </a>
            <Button onClick={() => open(null)}><Plus className="h-4 w-4" /> Add {current.noun}</Button>
          </>
        }
      />

      {!isLoading && !ready && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[14px] text-amber-900">
          The builder is hidden from customers until you have at least one visible gift box and one visible gift item.
        </div>
      )}

      <div className="mb-5 flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.step} role="tab" aria-selected={tab === t.step} onClick={() => setTab(t.step)} className="relative shrink-0 rounded-xl px-4 py-2.5 text-[14px] font-medium">
              {tab === t.step && <motion.span layoutId="curate-tab" className="absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-line" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span className={`relative flex items-center gap-2 ${tab === t.step ? "text-ink" : "text-ink-muted hover:text-ink"}`}>
                <Icon className="h-4 w-4" /> {t.label}
                <span className={`rounded-md px-1.5 text-[12px] tabular-nums ${tab === t.step ? "bg-cream-100 text-primary-700" : "bg-line/70"}`}>{counts[t.step] || 0}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mb-5 text-[14px] text-ink-muted">{current.help}</p>

      {isError ? (
        <div className="card"><EmptyState icon={Gift} title="Couldn't load options" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} /></div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      ) : !list.length ? (
        <div className="card"><EmptyState icon={current.icon} title={`No ${current.label.toLowerCase()} yet`} body={current.help} action={<Button onClick={() => open(null)}><Plus className="h-4 w-4" /> Add {current.noun}</Button>} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((o) => (
            <motion.div layout key={o._id} className={`card group overflow-hidden ${o.isActive ? "" : "opacity-60"}`}>
              <button onClick={() => open(o)} className="relative block aspect-[4/3] w-full bg-cream-100">
                {o.image ? <img src={o.image} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-ink-muted"><ImagePlus className="h-6 w-6" /></span>}
                {!o.isActive && <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[12px] font-semibold text-white">Hidden</span>}
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold leading-snug">{o.name}</p>
                  <p className="shrink-0 font-semibold tabular-nums">{naira(o.price)}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {o.step === "box" && <Pill>Holds {o.capacity}</Pill>}
                  {o.step === "extra" && o.group && <Pill>{o.group}</Pill>}
                  {o.step !== "box" && <Pill tone="zinc">Max {o.maxPerOrder} per box</Pill>}
                  {o.stock != null && <Pill tone={o.stock <= 3 ? "petal" : "zinc"}>{o.stock} in stock</Pill>}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <Toggle label={`Show ${o.name} to customers`} checked={o.isActive} onChange={(v) => patch.mutate({ id: o._id, isActive: v })} />
                    {o.isActive ? "Visible" : "Hidden"}
                  </label>
                  <div className="flex gap-0.5">
                    <button onClick={() => open(o)} className="rounded-lg p-2 text-ink-muted hover:bg-cream-100 hover:text-ink" aria-label={`Edit ${o.name}`}><Pencil className="h-4 w-4" /></button>
                    <button onClick={async () => (await confirm({ title: `Remove ${o.name}?`, body: "Customers won't be able to pick it any more. Orders that already include it are unaffected.", confirmLabel: "Remove", danger: true })) && remove.mutate(o._id)} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${o.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, editing: null })}
        title={drawer.editing ? `Edit ${drawer.editing.name}` : `Add ${TABS.find((t) => t.step === step)!.noun}`}
        footer={<><Button variant="ghost" onClick={() => setDrawer({ open: false, editing: null })}>Cancel</Button><Button onClick={() => save.mutate()} loading={save.isPending} disabled={form.name.trim().length < 2 || form.price === ""}>{drawer.editing ? "Save changes" : "Add"}</Button></>}
      >
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="flex flex-col gap-5">
          <div>
            <p className="label">Photo</p>
            {previewImg ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-100">
                <img src={previewImg} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { setFile(null); setRemoveImage(true); }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-white" aria-label="Remove photo"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-[14px] text-ink-muted hover:border-primary-300 hover:bg-cream-50">
                <ImagePlus className="h-6 w-6" /> Upload a photo
                <span className="text-[12px]">JPG, PNG or WEBP, up to 10MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
              </label>
            )}
          </div>
          <Field label="Name" htmlFor="o-name" error={errors.name}><input id="o-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={`input ${errors.name ? "input-error" : ""}`} placeholder={step === "box" ? "Signature Love Box" : step === "item" ? "Scented soy candle" : "Assorted chocolates"} /></Field>
          <Field label="Short description" htmlFor="o-desc" hint="Optional, one line."><input id="o-desc" maxLength={400} value={form.description} onChange={(e) => set("description", e.target.value)} className="input" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₦)" htmlFor="o-price" error={errors.price}><input id="o-price" type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} className={`input ${errors.price ? "input-error" : ""}`} /></Field>
            {step === "box" ? (
              <Field label="Holds how many gift items?" htmlFor="o-cap" error={errors.capacity}><input id="o-cap" type="number" min={1} max={50} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} className="input" /></Field>
            ) : (
              <Field label="Max per box" htmlFor="o-max" error={errors.maxPerOrder} hint="How many of this one customer can add."><input id="o-max" type="number" min={1} max={50} value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", e.target.value)} className="input" /></Field>
            )}
          </div>
          {step === "extra" && (
            <Field label="Group" htmlFor="o-group" hint="Shown as a heading, e.g. Food & treats, Drinks, Greeting cards.">
              <input id="o-group" list="extra-groups" value={form.group} onChange={(e) => set("group", e.target.value)} className="input" />
              <datalist id="extra-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stock" htmlFor="o-stock" hint="Leave blank if you don't track it."><input id="o-stock" type="number" min={0} value={form.stock} onChange={(e) => set("stock", e.target.value)} className="input" /></Field>
            <Field label="Display order" htmlFor="o-order" hint="Lower numbers show first."><input id="o-order" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} className="input" /></Field>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
            <div><p className="text-[14px] font-semibold">Visible to customers</p><p className="text-[12.5px] text-ink-muted">Hide it without deleting, e.g. when it's out of season.</p></div>
            <Toggle label="Visible to customers" checked={form.isActive} onChange={(v) => set("isActive", v)} />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
