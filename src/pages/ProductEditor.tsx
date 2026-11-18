import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { UploadCloud, X, Plus, Video, GripVertical } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import type { Category, Product } from "../lib/types";
import { Button, Drawer, Field, Skeleton, Toggle } from "../components/ui";

type Opt = { value: string; label: string };

const selectStyles = {
  control: (b: any, s: any) => ({ ...b, minHeight: 44, borderRadius: 12, borderColor: s.isFocused ? "#D4258F" : "#EEE4EA", boxShadow: s.isFocused ? "0 0 0 4px rgba(253,102,195,0.15)" : "none", "&:hover": { borderColor: "#D4258F" }, fontSize: 14.5 }),
  multiValue: (b: any) => ({ ...b, backgroundColor: "#FBEAF3", borderRadius: 8 }),
  multiValueLabel: (b: any) => ({ ...b, color: "#1E161B", fontWeight: 500 }),
  multiValueRemove: (b: any) => ({ ...b, borderRadius: 8, ":hover": { backgroundColor: "#D4258F", color: "white" } }),
  option: (b: any, s: any) => ({ ...b, fontSize: 14, backgroundColor: s.isFocused ? "#FBEAF3" : "white", color: "#1E161B" }),
  menu: (b: any) => ({ ...b, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 40px -15px rgba(30,22,27,.3)", zIndex: 70 }),
  menuPortal: (b: any) => ({ ...b, zIndex: 80 }),
};

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Product name is too short.").required("Product name is required."),
  price: Yup.number().typeError("Price must be a number.").positive("Price must be greater than 0.").required("Price is required."),
  compareAtPrice: Yup.number().typeError("Must be a number.").min(0).nullable().transform((v, o) => (o === "" ? null : v)),
  stock: Yup.number().typeError("Stock must be a number.").integer("Whole numbers only.").min(0, "Stock can't be negative.").required("Stock is required."),
  categories: Yup.array().min(1, "Pick at least one category."),
  sizes: Yup.array().of(Yup.object({ label: Yup.string().trim().required("Label needed"), price: Yup.number().typeError("Number").positive("Above 0").required("Price needed") })),
});

const MAX_MB = 40;

type Opt2 = { value: string; label: string };
interface FormValues {
  name: string; description: string; price: string; compareAtPrice: string; stock: string;
  categories: Opt2[]; giftTypes: Opt2[]; sizes: { label: string; price: string }[];
  isActive: boolean; isFeatured: boolean;
}

export default function ProductEditor({ open, productId, onClose }: { open: boolean; productId: string | null; onClose: () => void }) {
  const qc = useQueryClient();
  const editing = !!productId;
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [existing, setExisting] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["categories"], queryFn: async () => (await api.get("/categories")).data });
  const { data: product, isLoading, isError: loadFailed, error: loadError, refetch: reload } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => (await api.get(`/products/manage/${productId}`)).data,
    enabled: open && editing,
  });

  const byId = useMemo(() => new Map(categories.map((c) => [c._id, c])), [categories]);
  const categoryOptions: Opt[] = useMemo(
    () => categories.filter((c) => !c.isGiftType).map((c) => ({ value: c._id, label: c.parent ? `${byId.get(c.parent)?.name || "—"} › ${c.name}` : c.name })),
    [categories, byId]
  );
  const giftTypeOptions: Opt[] = useMemo(() => categories.filter((c) => c.isGiftType).map((c) => ({ value: c._id, label: c.name })), [categories]);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "", description: "", price: "", compareAtPrice: "", stock: "10",
      categories: [] as Opt[], giftTypes: [] as Opt[], sizes: [] as { label: string; price: string }[],
      isActive: true, isFeatured: false,
    },
    validationSchema: schema,
    onSubmit: (v: FormValues) => { save.mutate(v); },
  });

  // Load product into the form when editing / reset when creating
  useEffect(() => {
    if (!open) return;
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setProgress(null);
    if (editing && product) {
      formik.resetForm({
        values: {
          name: product.name, description: product.description || "", price: String(product.price), compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
          stock: String(product.stock ?? 0),
          categories: (product.categories || []).map((c) => ({ value: c._id, label: categoryOptions.find((o) => o.value === c._id)?.label || c.name })),
          giftTypes: (product.giftTypes || []).map((c) => ({ value: c._id, label: c.name })),
          sizes: (product.sizes || []).map((s) => ({ label: s.label, price: String(s.price) })),
          isActive: product.isActive, isFeatured: product.isFeatured,
        },
      });
      setExisting([...(product.images || []), ...(product.videos || [])]);
    } else if (!editing) {
      formik.resetForm();
      setExisting([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, product]);

  const save = useMutation({
    mutationFn: (v: FormValues) => {
      const fd = new FormData();
      fd.append("name", v.name.trim());
      fd.append("description", v.description);
      fd.append("price", String(v.price));
      if (v.compareAtPrice !== "") fd.append("compareAtPrice", String(v.compareAtPrice));
      fd.append("stock", String(v.stock));
      fd.append("categories", JSON.stringify(v.categories.map((c) => c.value)));
      fd.append("giftTypes", JSON.stringify(v.giftTypes.map((c) => c.value)));
      fd.append("sizes", JSON.stringify(v.sizes.map((s) => ({ label: s.label.trim(), price: Number(s.price) }))));
      fd.append("isActive", String(v.isActive));
      fd.append("isFeatured", String(v.isFeatured));
      if (editing) fd.append("existingMedia", JSON.stringify(existing));
      files.forEach((f) => fd.append("media", f.file));
      const cfg = { onUploadProgress: (e: any) => files.length && e.total && setProgress(Math.round((e.loaded / e.total) * 100)) };
      return editing ? api.put(`/products/${productId}`, fd, cfg) : api.post("/products", fd, cfg);
    },
    onSuccess: (res) => {
      toast.success(msg(res, editing ? "Product updated" : "Product created"));
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
      onClose();
    },
    onError: (e) => {
      const f = fieldErrors(e);
      const mapped: Record<string, string> = {};
      for (const [k, m] of Object.entries(f)) mapped[k.split(".")[0]] = m;
      formik.setErrors(mapped as any);
      toast.error(errorMessage(e, "Couldn't save the product."));
    },
    onSettled: () => setProgress(null),
  });

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const ok: { file: File; url: string }[] = [];
    for (const file of Array.from(list)) {
      if (!/^(image\/(jpe?g|png|webp)|video\/(mp4|quicktime|webm))$/.test(file.type)) {
        toast.error(`${file.name} isn't supported. Use JPG, PNG, WEBP, MP4, MOV or WEBM.`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_MB}MB.`);
        continue;
      }
      ok.push({ file, url: URL.createObjectURL(file) });
    }
    if (existing.length + files.length + ok.length > 8) {
      toast.error("A product can have up to 8 photos and videos.");
      return;
    }
    setFiles((p) => [...p, ...ok]);
  };

  const err = (k: string) => (formik.touched as any)[k] && (formik.errors as any)[k];
  const isVideo = (u: string) => /\/video\/|\.(mp4|mov|webm)$/i.test(u);
  const busy = save.isPending;

  return (
    <Drawer
      open={open}
      onClose={() => !busy && onClose()}
      title={editing ? "Edit product" : "New product"}
      sub={editing ? product?.name : "It goes live on the store as soon as you save."}
      width="max-w-2xl"
      footer={
        <>
          {progress !== null && (
            <div className="mr-auto flex items-center gap-3 text-[13px] text-ink-muted">
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-line"><motion.div className="h-full bg-ribbon-600" animate={{ width: `${progress}%` }} /></div>
              Uploading {progress}%
            </div>
          )}
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={() => formik.handleSubmit()} loading={busy} disabled={editing && (isLoading || loadFailed)}>{editing ? "Save changes" : "Create product"}</Button>
        </>
      }
    >
      {editing && isLoading ? (
        <div className="flex flex-col gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : editing && loadFailed ? (
        <div className="rounded-2xl bg-red-50 p-5 text-[14.5px] text-red-800">
          <p className="font-semibold">This product couldn't be loaded</p>
          <p className="mt-1">{errorMessage(loadError)}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => reload()}>Try again</Button>
        </div>
      ) : (
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* Media */}
          <section>
            <p className="label">Photos & videos <span className="font-normal text-ink-muted">({existing.length + files.length}/8, first image is the cover)</span></p>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-7 text-center transition ${dragOver ? "border-ribbon-500 bg-petal-50" : "border-line hover:border-ribbon-300 hover:bg-petal-50/60"}`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-petal-100 text-ribbon-600"><UploadCloud className="h-5 w-5" /></span>
              <span className="text-[14.5px] font-medium">Drop files here or click to upload</span>
              <span className="text-[12.5px] text-ink-muted">JPG, PNG, WEBP or short MP4/MOV videos, up to {MAX_MB}MB each</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </label>
            {(existing.length > 0 || files.length > 0) && (
              <ul className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                <AnimatePresence initial={false}>
                  {existing.map((u, i) => (
                    <motion.li key={u} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative aspect-square overflow-hidden rounded-xl bg-petal-100">
                      {isVideo(u) ? <span className="grid h-full place-items-center bg-ink text-white"><Video className="h-5 w-5" /></span> : <img src={u} alt="" className="h-full w-full object-cover" />}
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded-md bg-white/90 px-1.5 text-[11px] font-semibold">Cover</span>}
                      <button type="button" onClick={() => setExisting((p) => p.filter((x) => x !== u))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100" aria-label="Remove media"><X className="h-3.5 w-3.5" /></button>
                    </motion.li>
                  ))}
                  {files.map((f) => (
                    <motion.li key={f.url} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative aspect-square overflow-hidden rounded-xl bg-petal-100 ring-2 ring-ribbon-300">
                      {f.file.type.startsWith("video/") ? <span className="grid h-full place-items-center bg-ink text-white"><Video className="h-5 w-5" /></span> : <img src={f.url} alt="" className="h-full w-full object-cover" />}
                      <span className="absolute bottom-1 left-1 rounded-md bg-ribbon-600 px-1.5 text-[11px] font-semibold text-white">New</span>
                      <button type="button" onClick={() => { URL.revokeObjectURL(f.url); setFiles((p) => p.filter((x) => x.url !== f.url)); }} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100" aria-label="Remove file"><X className="h-3.5 w-3.5" /></button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>

          <Field label="Product name" htmlFor="name" error={err("name")}>
            <input id="name" {...formik.getFieldProps("name")} placeholder="e.g. Blush Peony Bouquet" className={`input ${err("name") ? "input-error" : ""}`} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₦)" htmlFor="price" error={err("price")}>
              <input id="price" type="number" inputMode="numeric" min={0} {...formik.getFieldProps("price")} className={`input ${err("price") ? "input-error" : ""}`} />
            </Field>
            <Field label="Compare-at price" htmlFor="compareAtPrice" error={err("compareAtPrice")} hint="Shows as a sale price.">
              <input id="compareAtPrice" type="number" min={0} {...formik.getFieldProps("compareAtPrice")} className="input" />
            </Field>
            <Field label="Stock" htmlFor="stock" error={err("stock")}>
              <input id="stock" type="number" min={0} {...formik.getFieldProps("stock")} className={`input ${err("stock") ? "input-error" : ""}`} />
            </Field>
          </div>

          <Field label="Occasions & categories" error={(formik.submitCount > 0 || formik.touched.categories) ? (formik.errors.categories as string) : undefined}>
            <Select isMulti styles={selectStyles} menuPortalTarget={document.body} options={categoryOptions} value={formik.values.categories} onChange={(v) => formik.setFieldValue("categories", v)} onBlur={() => formik.setFieldTouched("categories")} placeholder="Search categories…" noOptionsMessage={() => "No matching categories"} />
          </Field>
          <Field label="Gift types (optional)" hint="Helps customers filter, e.g. Flowers or Hampers.">
            <Select isMulti styles={selectStyles} menuPortalTarget={document.body} options={giftTypeOptions} value={formik.values.giftTypes} onChange={(v) => formik.setFieldValue("giftTypes", v)} placeholder="Choose gift types…" />
          </Field>

          <Field label="Description" htmlFor="description">
            <textarea id="description" rows={4} {...formik.getFieldProps("description")} placeholder="What's inside, how it's wrapped, and who it's perfect for." className="input resize-y" />
          </Field>

          {/* Sizes */}
          <section className="rounded-2xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold">Sizes</p>
                <p className="text-[12.5px] text-ink-muted">Optional. Each size has its own price; leave empty for a single price.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => formik.setFieldValue("sizes", [...formik.values.sizes, { label: "", price: "" }])}><Plus className="h-4 w-4" /> Add size</Button>
            </div>
            <AnimatePresence initial={false}>
              {formik.values.sizes.map((s, i) => {
                const se = (formik.errors.sizes as any)?.[i];
                return (
                  <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="flex items-start gap-2 py-1.5">
                      <GripVertical className="mt-3 h-4 w-4 text-ink-muted/50" />
                      <div className="flex-1">
                        <input value={s.label} onChange={(e) => formik.setFieldValue(`sizes.${i}.label`, e.target.value)} placeholder="e.g. Classic (24 stems)" className={`input ${formik.submitCount && se?.label ? "input-error" : ""}`} aria-label={`Size ${i + 1} label`} />
                      </div>
                      <div className="w-36">
                        <input value={s.price} type="number" onChange={(e) => formik.setFieldValue(`sizes.${i}.price`, e.target.value)} placeholder="Price" className={`input ${formik.submitCount && se?.price ? "input-error" : ""}`} aria-label={`Size ${i + 1} price`} />
                      </div>
                      <button type="button" onClick={() => formik.setFieldValue("sizes", formik.values.sizes.filter((_, j) => j !== i))} className="mt-1 rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600" aria-label="Remove size"><X className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </section>

          <section className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            <div className="flex items-center justify-between gap-4 p-4">
              <div><p className="text-[14px] font-semibold">Visible on the store</p><p className="text-[12.5px] text-ink-muted">Hidden products can't be found or bought.</p></div>
              <Toggle label="Visible on the store" checked={formik.values.isActive} onChange={(v) => formik.setFieldValue("isActive", v)} />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <div><p className="text-[14px] font-semibold">Curator's pick</p><p className="text-[12.5px] text-ink-muted">Featured on the home page.</p></div>
              <Toggle label="Curator's pick" checked={formik.values.isFeatured} onChange={(v) => formik.setFieldValue("isFeatured", v)} />
            </div>
          </section>
        </form>
      )}
    </Drawer>
  );
}
