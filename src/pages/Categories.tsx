import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Search, Tags, Pencil, Trash2, ChevronRight } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import type { Category } from "../lib/types";
import { Button, Drawer, EmptyState, Field, PageHeader, Pill, Skeleton, Toggle, useConfirm } from "../components/ui";

type Form = { name: string; parent: string; isGiftType: boolean };
const blank: Form = { name: "", parent: "", isGiftType: false };

export default function Categories() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"occasions" | "gifts">("occasions");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState<{ open: boolean; editing: Category | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Form>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [], isLoading, isError, error, refetch } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const occasions = categories.filter((c) => !c.parent && !c.isGiftType);
  const giftTypes = categories.filter((c) => c.isGiftType);
  const childrenOf = useMemo(() => {
    const m = new Map<string, Category[]>();
    categories.forEach((c) => c.parent && m.set(c.parent, [...(m.get(c.parent) || []), c]));
    return m;
  }, [categories]);
  const term = search.trim().toLowerCase();
  const match = (c: Category) => c.name.toLowerCase().includes(term);

  const openCreate = (parent = "") => {
    setForm({ ...blank, parent, isGiftType: tab === "gifts" && !parent });
    setErrors({});
    setDrawer({ open: true, editing: null });
  };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, parent: c.parent || "", isGiftType: c.isGiftType });
    setErrors({});
    setDrawer({ open: true, editing: c });
  };

  const save = useMutation({
    mutationFn: () => {
      const body = { name: form.name.trim(), parent: form.parent || null, isGiftType: form.isGiftType };
      return drawer.editing ? api.put(`/categories/${drawer.editing._id}`, body) : api.post("/categories", body);
    },
    onSuccess: (res) => {
      toast.success(msg(res, "Saved"));
      qc.invalidateQueries({ queryKey: ["categories"] });
      if (form.parent) setExpanded((s) => new Set(s).add(form.parent));
      setDrawer({ open: false, editing: null });
    },
    onError: (e) => {
      setErrors(fieldErrors(e));
      toast.error(errorMessage(e, "Couldn't save the category."));
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: (res) => {
      toast.success(msg(res, "Category deleted"));
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't delete the category."), { duration: 6000 }),
  });

  const askDelete = async (c: Category) => {
    if (await confirm({ title: `Delete “${c.name}”?`, body: "Customers won't be able to browse it any more. Categories that still hold products or subcategories can't be deleted.", confirmLabel: "Delete", danger: true })) remove.mutate(c._id);
  };

  const Row = ({ c, depth = 0 }: { c: Category; depth?: number }) => {
    const kids = childrenOf.get(c._id) || [];
    const open = expanded.has(c._id) || (!!term && kids.some(match));
    return (
      <>
        <div className={`group flex items-center gap-2 border-t border-line px-4 py-2.5 hover:bg-cream-50/60 ${depth ? "pl-12" : ""}`}>
          {depth === 0 && kids.length > 0 ? (
            <button onClick={() => setExpanded((s) => { const n = new Set(s); n.has(c._id) ? n.delete(c._id) : n.add(c._id); return n; })} className="rounded-md p-1 hover:bg-cream-100" aria-label={open ? "Collapse" : "Expand"} aria-expanded={open}>
              <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`} />
            </button>
          ) : <span className="w-6" />}
          <span className={`flex-1 text-[14.5px] ${depth ? "text-ink-soft" : "font-semibold"}`}>{c.name}</span>
          {depth === 0 && kids.length > 0 && <Pill tone="zinc">{kids.length}</Pill>}
          <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            {depth === 0 && !c.isGiftType && <button onClick={() => openCreate(c._id)} className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-100 hover:text-ink" title="Add subcategory" aria-label={`Add subcategory to ${c.name}`}><Plus className="h-4 w-4" /></button>}
            <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-ink-muted hover:bg-cream-100 hover:text-ink" title="Edit" aria-label={`Edit ${c.name}`}><Pencil className="h-4 w-4" /></button>
            <button onClick={() => askDelete(c)} className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600" title="Delete" aria-label={`Delete ${c.name}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {open && kids.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-canvas/50">
              {kids.filter((k) => !term || match(k) || match(c)).map((k) => <Row key={k._id} c={k} depth={1} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  const list = (tab === "occasions" ? occasions : giftTypes).filter((c) => !term || match(c) || (childrenOf.get(c._id) || []).some(match));

  return (
    <div>
      <PageHeader title="Categories" sub="Occasions shape the store's menus. Gift types let customers filter by what's inside." actions={<Button onClick={() => openCreate()}><Plus className="h-4 w-4" /> New {tab === "gifts" ? "gift type" : "occasion"}</Button>} />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex rounded-xl border border-line p-1 text-[13.5px]">
            {([["occasions", `Occasions (${occasions.length})`], ["gifts", `Gift types (${giftTypes.length})`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 font-medium ${tab === k ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}>{l}</button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories" className="input pl-9" aria-label="Search categories" />
          </div>
        </div>
        {isError ? (
          <EmptyState icon={Tags} title="Couldn't load categories" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className="flex flex-col gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !list.length ? (
          <EmptyState icon={Tags} title={term ? "Nothing matches" : "No categories yet"} body={term ? "Try another word." : "Create your first one to start organising the store."} />
        ) : (
          list.map((c) => <Row key={c._id} c={c} />)
        )}
      </div>

      <Drawer
        open={drawer.open}
        onClose={() => setDrawer({ open: false, editing: null })}
        title={drawer.editing ? `Edit “${drawer.editing.name}”` : form.parent ? "New subcategory" : form.isGiftType ? "New gift type" : "New occasion"}
        width="max-w-md"
        footer={<><Button variant="ghost" onClick={() => setDrawer({ open: false, editing: null })}>Cancel</Button><Button onClick={() => save.mutate()} loading={save.isPending} disabled={form.name.trim().length < 2}>{drawer.editing ? "Save changes" : "Create"}</Button></>}
      >
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="flex flex-col gap-5">
          <Field label="Name" htmlFor="cat-name" error={errors.name}>
            <input id="cat-name" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Milestone Birthdays" className={`input ${errors.name ? "input-error" : ""}`} />
          </Field>
          {!form.isGiftType && (
            <Field label="Sits under" htmlFor="cat-parent" error={errors.parent} hint="Leave as top-level to show it in the main Occasions menu.">
              <select id="cat-parent" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className="input">
                <option value="">Top-level occasion</option>
                {occasions.filter((o) => o._id !== drawer.editing?._id).map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
              </select>
            </Field>
          )}
          {!form.parent && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
              <div><p className="text-[14px] font-semibold">Gift type</p><p className="text-[12.5px] text-ink-muted">e.g. Flowers, Cakes, Perfumes — used as a filter, not a menu.</p></div>
              <Toggle label="Gift type" checked={form.isGiftType} onChange={(v) => setForm({ ...form, isGiftType: v, parent: "" })} />
            </div>
          )}
        </form>
      </Drawer>
    </div>
  );
}
