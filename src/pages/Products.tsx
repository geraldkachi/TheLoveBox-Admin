import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Package, Pencil, Trash2, Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { api, errorMessage, msg } from "../lib/api";
import { naira } from "../lib/format";
import type { Paged, Product } from "../lib/types";
import { Button, EmptyState, PageHeader, Pill, Skeleton, Toggle, useConfirm, useDebounced } from "../components/ui";
import ProductEditor from "./ProductEditor";

const SITE = import.meta.env.VITE_SITE_URL || "https://the-love-box-customer.vercel.app";
const LIMIT = 20;

export default function Products() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const q = useDebounced(search.trim());

  const { data, isLoading, isError, error, refetch } = useQuery<Paged<Product>>({
    queryKey: ["products", q, status, page],
    queryFn: async () => (await api.get("/products/manage/list", { params: { search: q || undefined, status, page, limit: LIMIT } })).data,
    placeholderData: (p) => p,
  });

  const patch = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Product> }) => api.put(`/products/${id}`, body),
    onMutate: async ({ id, body }) => {
      // optimistic toggle
      const key = ["products", q, status, page];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Paged<Product>>(key);
      if (prev) qc.setQueryData(key, { ...prev, items: prev.items.map((p) => (p._id === id ? { ...p, ...body } : p)) });
      return { prev, key };
    },
    onSuccess: (res) => toast.success(msg(res, "Product updated")),
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
      toast.error(errorMessage(e, "Couldn't update the product."));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: (res) => {
      toast.success(msg(res, "Product deleted"));
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn't delete the product.")),
  });

  const askDelete = async (p: Product) => {
    if (await confirm({ title: `Delete “${p.name}”?`, body: "It disappears from the store and its photos are removed. Past orders keep their details.", confirmLabel: "Delete product", danger: true })) {
      remove.mutate(p._id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        sub={data ? `${data.total} product${data.total === 1 ? "" : "s"} in your catalogue` : "Your catalogue"}
        actions={<Button onClick={() => setEditor({ open: true, id: null })}><Plus className="h-4 w-4" /> New product</Button>}
      />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search products" className="input pl-9" aria-label="Search products" />
          </div>
          <div className="flex rounded-xl border border-line p-1 text-[13.5px]">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-lg px-3 py-1.5 font-medium capitalize ${status === s ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}>
                {s === "inactive" ? "Hidden" : s === "active" ? "Visible" : "All"}
              </button>
            ))}
          </div>
        </div>

        {isError ? (
          <EmptyState icon={Package} title="Couldn't load products" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className="flex flex-col gap-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState
            icon={Package}
            title={q ? "No products match" : "Add your first product"}
            body={q ? "Try a different name." : "Upload photos, set a price and pick its occasions. It goes live straight away."}
            action={!q && <Button onClick={() => setEditor({ open: true, id: null })}><Plus className="h-4 w-4" /> New product</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[14px]">
              <thead>
                <tr className="text-left text-[12.5px] text-ink-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Visible</th>
                  <th className="px-3 py-3 font-medium">Pick</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p._id} className="group border-t border-line hover:bg-cream-50/60">
                    <td className="px-5 py-3">
                      <button onClick={() => setEditor({ open: true, id: p._id })} className="flex items-center gap-3 text-left">
                        <img src={p.images?.[0] || "/brand/logo-mark.png"} alt="" className="h-12 w-12 rounded-xl bg-cream-100 object-cover" />
                        <span className="min-w-0">
                          <span className="block max-w-[280px] truncate font-semibold group-hover:text-primary-700">{p.name}</span>
                          <span className="block max-w-[280px] truncate text-[12.5px] text-ink-muted">{p.categories?.map((c) => c.name).join(", ") || "No category"}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <span className="font-medium">{naira(p.price)}</span>
                      {!!p.sizes?.length && <span className="ml-1.5"><Pill tone="zinc">{p.sizes.length} sizes</Pill></span>}
                    </td>
                    <td className="px-3 py-3">
                      {p.stock <= 0 ? <Pill tone="zinc">Sold out</Pill> : p.stock <= 3 ? <span className="font-medium text-amber-700">{p.stock} left</span> : <span className="tabular-nums">{p.stock}</span>}
                    </td>
                    <td className="px-3 py-3"><Toggle label={`Show ${p.name} on store`} checked={p.isActive} onChange={(v) => patch.mutate({ id: p._id, body: { isActive: v } })} /></td>
                    <td className="px-3 py-3">
                      <button onClick={() => patch.mutate({ id: p._id, body: { isFeatured: !p.isFeatured } })} aria-label={p.isFeatured ? "Remove from curator's picks" : "Add to curator's picks"} aria-pressed={p.isFeatured} className="rounded-lg p-1.5 hover:bg-cream-100">
                        <Star className={`h-[18px] w-[18px] ${p.isFeatured ? "fill-gold-400 text-primary-500" : "text-ink-muted"}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <a href={`${SITE}/product/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-ink-muted hover:bg-cream-100 hover:text-ink" title="View on store" aria-label="View on store"><ExternalLink className="h-4 w-4" /></a>
                        <button onClick={() => setEditor({ open: true, id: p._id })} className="rounded-lg p-2 text-ink-muted hover:bg-cream-100 hover:text-ink" title="Edit" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => askDelete(p)} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600" title="Delete" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[13.5px] text-ink-muted">
            <span>Page {data.page} of {data.pages}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <ProductEditor open={editor.open} productId={editor.id} onClose={() => setEditor({ open: false, id: null })} />
    </div>
  );
}
