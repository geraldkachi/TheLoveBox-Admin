import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { UploadCloud, X, Plus, Video, GripVertical } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { Button, Drawer, Field, Skeleton, Toggle } from "../components/ui";
const selectStyles = {
    control: (b, s) => ({ ...b, minHeight: 44, borderRadius: 12, borderColor: s.isFocused ? "#D4258F" : "#EEE4EA", boxShadow: s.isFocused ? "0 0 0 4px rgba(253,102,195,0.15)" : "none", "&:hover": { borderColor: "#D4258F" }, fontSize: 14.5 }),
    multiValue: (b) => ({ ...b, backgroundColor: "#FBEAF3", borderRadius: 8 }),
    multiValueLabel: (b) => ({ ...b, color: "#1E161B", fontWeight: 500 }),
    multiValueRemove: (b) => ({ ...b, borderRadius: 8, ":hover": { backgroundColor: "#D4258F", color: "white" } }),
    option: (b, s) => ({ ...b, fontSize: 14, backgroundColor: s.isFocused ? "#FBEAF3" : "white", color: "#1E161B" }),
    menu: (b) => ({ ...b, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 40px -15px rgba(30,22,27,.3)", zIndex: 70 }),
    menuPortal: (b) => ({ ...b, zIndex: 80 }),
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
export default function ProductEditor({ open, productId, onClose }) {
    const qc = useQueryClient();
    const editing = !!productId;
    const [files, setFiles] = useState([]);
    const [existing, setExisting] = useState([]);
    const [progress, setProgress] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.get("/categories")).data });
    const { data: product, isLoading, isError: loadFailed, error: loadError, refetch: reload } = useQuery({
        queryKey: ["product", productId],
        queryFn: async () => (await api.get(`/products/manage/${productId}`)).data,
        enabled: open && editing,
    });
    const byId = useMemo(() => new Map(categories.map((c) => [c._id, c])), [categories]);
    const categoryOptions = useMemo(() => categories.filter((c) => !c.isGiftType).map((c) => ({ value: c._id, label: c.parent ? `${byId.get(c.parent)?.name || "—"} › ${c.name}` : c.name })), [categories, byId]);
    const giftTypeOptions = useMemo(() => categories.filter((c) => c.isGiftType).map((c) => ({ value: c._id, label: c.name })), [categories]);
    const formik = useFormik({
        initialValues: {
            name: "", description: "", price: "", compareAtPrice: "", stock: "10",
            categories: [], giftTypes: [], sizes: [],
            isActive: true, isFeatured: false,
        },
        validationSchema: schema,
        onSubmit: (v) => { save.mutate(v); },
    });
    // Load product into the form when editing / reset when creating
    useEffect(() => {
        if (!open)
            return;
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
        }
        else if (!editing) {
            formik.resetForm();
            setExisting([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editing, product]);
    const save = useMutation({
        mutationFn: (v) => {
            const fd = new FormData();
            fd.append("name", v.name.trim());
            fd.append("description", v.description);
            fd.append("price", String(v.price));
            if (v.compareAtPrice !== "")
                fd.append("compareAtPrice", String(v.compareAtPrice));
            fd.append("stock", String(v.stock));
            fd.append("categories", JSON.stringify(v.categories.map((c) => c.value)));
            fd.append("giftTypes", JSON.stringify(v.giftTypes.map((c) => c.value)));
            fd.append("sizes", JSON.stringify(v.sizes.map((s) => ({ label: s.label.trim(), price: Number(s.price) }))));
            fd.append("isActive", String(v.isActive));
            fd.append("isFeatured", String(v.isFeatured));
            if (editing)
                fd.append("existingMedia", JSON.stringify(existing));
            files.forEach((f) => fd.append("media", f.file));
            const cfg = { onUploadProgress: (e) => files.length && e.total && setProgress(Math.round((e.loaded / e.total) * 100)) };
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
            const mapped = {};
            for (const [k, m] of Object.entries(f))
                mapped[k.split(".")[0]] = m;
            formik.setErrors(mapped);
            toast.error(errorMessage(e, "Couldn't save the product."));
        },
        onSettled: () => setProgress(null),
    });
    const addFiles = (list) => {
        if (!list)
            return;
        const ok = [];
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
    const err = (k) => formik.touched[k] && formik.errors[k];
    const isVideo = (u) => /\/video\/|\.(mp4|mov|webm)$/i.test(u);
    const busy = save.isPending;
    return (_jsx(Drawer, { open: open, onClose: () => !busy && onClose(), title: editing ? "Edit product" : "New product", sub: editing ? product?.name : "It goes live on the store as soon as you save.", width: "max-w-2xl", footer: _jsxs(_Fragment, { children: [progress !== null && (_jsxs("div", { className: "mr-auto flex items-center gap-3 text-[13px] text-ink-muted", children: [_jsx("div", { className: "h-1.5 w-32 overflow-hidden rounded-full bg-line", children: _jsx(motion.div, { className: "h-full bg-ribbon-600", animate: { width: `${progress}%` } }) }), "Uploading ", progress, "%"] })), _jsx(Button, { variant: "ghost", onClick: onClose, disabled: busy, children: "Cancel" }), _jsx(Button, { onClick: () => formik.handleSubmit(), loading: busy, disabled: editing && (isLoading || loadFailed), children: editing ? "Save changes" : "Create product" })] }), children: editing && isLoading ? (_jsx("div", { className: "flex flex-col gap-4", children: [0, 1, 2, 3].map((i) => _jsx(Skeleton, { className: "h-16" }, i)) })) : editing && loadFailed ? (_jsxs("div", { className: "rounded-2xl bg-red-50 p-5 text-[14.5px] text-red-800", children: [_jsx("p", { className: "font-semibold", children: "This product couldn't be loaded" }), _jsx("p", { className: "mt-1", children: errorMessage(loadError) }), _jsx(Button, { variant: "ghost", size: "sm", className: "mt-3", onClick: () => reload(), children: "Try again" })] })) : (_jsxs("form", { onSubmit: formik.handleSubmit, className: "flex flex-col gap-6", noValidate: true, children: [_jsxs("section", { children: [_jsxs("p", { className: "label", children: ["Photos & videos ", _jsxs("span", { className: "font-normal text-ink-muted", children: ["(", existing.length + files.length, "/8, first image is the cover)"] })] }), _jsxs("label", { onDragOver: (e) => { e.preventDefault(); setDragOver(true); }, onDragLeave: () => setDragOver(false), onDrop: (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }, className: `flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-7 text-center transition ${dragOver ? "border-ribbon-500 bg-petal-50" : "border-line hover:border-ribbon-300 hover:bg-petal-50/60"}`, children: [_jsx("span", { className: "grid h-11 w-11 place-items-center rounded-full bg-petal-100 text-ribbon-600", children: _jsx(UploadCloud, { className: "h-5 w-5" }) }), _jsx("span", { className: "text-[14.5px] font-medium", children: "Drop files here or click to upload" }), _jsxs("span", { className: "text-[12.5px] text-ink-muted", children: ["JPG, PNG, WEBP or short MP4/MOV videos, up to ", MAX_MB, "MB each"] }), _jsx("input", { type: "file", multiple: true, accept: "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm", className: "sr-only", onChange: (e) => { addFiles(e.target.files); e.target.value = ""; } })] }), (existing.length > 0 || files.length > 0) && (_jsx("ul", { className: "mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-5", children: _jsxs(AnimatePresence, { initial: false, children: [existing.map((u, i) => (_jsxs(motion.li, { layout: true, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "group relative aspect-square overflow-hidden rounded-xl bg-petal-100", children: [isVideo(u) ? _jsx("span", { className: "grid h-full place-items-center bg-ink text-white", children: _jsx(Video, { className: "h-5 w-5" }) }) : _jsx("img", { src: u, alt: "", className: "h-full w-full object-cover" }), i === 0 && _jsx("span", { className: "absolute bottom-1 left-1 rounded-md bg-white/90 px-1.5 text-[11px] font-semibold", children: "Cover" }), _jsx("button", { type: "button", onClick: () => setExisting((p) => p.filter((x) => x !== u)), className: "absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100", "aria-label": "Remove media", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] }, u))), files.map((f) => (_jsxs(motion.li, { layout: true, initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 }, className: "group relative aspect-square overflow-hidden rounded-xl bg-petal-100 ring-2 ring-ribbon-300", children: [f.file.type.startsWith("video/") ? _jsx("span", { className: "grid h-full place-items-center bg-ink text-white", children: _jsx(Video, { className: "h-5 w-5" }) }) : _jsx("img", { src: f.url, alt: "", className: "h-full w-full object-cover" }), _jsx("span", { className: "absolute bottom-1 left-1 rounded-md bg-ribbon-600 px-1.5 text-[11px] font-semibold text-white", children: "New" }), _jsx("button", { type: "button", onClick: () => { URL.revokeObjectURL(f.url); setFiles((p) => p.filter((x) => x.url !== f.url)); }, className: "absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100", "aria-label": "Remove file", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] }, f.url)))] }) }))] }), _jsx(Field, { label: "Product name", htmlFor: "name", error: err("name"), children: _jsx("input", { id: "name", ...formik.getFieldProps("name"), placeholder: "e.g. Blush Peony Bouquet", className: `input ${err("name") ? "input-error" : ""}` }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [_jsx(Field, { label: "Price (\u20A6)", htmlFor: "price", error: err("price"), children: _jsx("input", { id: "price", type: "number", inputMode: "numeric", min: 0, ...formik.getFieldProps("price"), className: `input ${err("price") ? "input-error" : ""}` }) }), _jsx(Field, { label: "Compare-at price", htmlFor: "compareAtPrice", error: err("compareAtPrice"), hint: "Shows as a sale price.", children: _jsx("input", { id: "compareAtPrice", type: "number", min: 0, ...formik.getFieldProps("compareAtPrice"), className: "input" }) }), _jsx(Field, { label: "Stock", htmlFor: "stock", error: err("stock"), children: _jsx("input", { id: "stock", type: "number", min: 0, ...formik.getFieldProps("stock"), className: `input ${err("stock") ? "input-error" : ""}` }) })] }), _jsx(Field, { label: "Occasions & categories", error: (formik.submitCount > 0 || formik.touched.categories) ? formik.errors.categories : undefined, children: _jsx(Select, { isMulti: true, styles: selectStyles, menuPortalTarget: document.body, options: categoryOptions, value: formik.values.categories, onChange: (v) => formik.setFieldValue("categories", v), onBlur: () => formik.setFieldTouched("categories"), placeholder: "Search categories\u2026", noOptionsMessage: () => "No matching categories" }) }), _jsx(Field, { label: "Gift types (optional)", hint: "Helps customers filter, e.g. Flowers or Hampers.", children: _jsx(Select, { isMulti: true, styles: selectStyles, menuPortalTarget: document.body, options: giftTypeOptions, value: formik.values.giftTypes, onChange: (v) => formik.setFieldValue("giftTypes", v), placeholder: "Choose gift types\u2026" }) }), _jsx(Field, { label: "Description", htmlFor: "description", children: _jsx("textarea", { id: "description", rows: 4, ...formik.getFieldProps("description"), placeholder: "What's inside, how it's wrapped, and who it's perfect for.", className: "input resize-y" }) }), _jsxs("section", { className: "rounded-2xl border border-line p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-semibold", children: "Sizes" }), _jsx("p", { className: "text-[12.5px] text-ink-muted", children: "Optional. Each size has its own price; leave empty for a single price." })] }), _jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => formik.setFieldValue("sizes", [...formik.values.sizes, { label: "", price: "" }]), children: [_jsx(Plus, { className: "h-4 w-4" }), " Add size"] })] }), _jsx(AnimatePresence, { initial: false, children: formik.values.sizes.map((s, i) => {
                                const se = formik.errors.sizes?.[i];
                                return (_jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "flex items-start gap-2 py-1.5", children: [_jsx(GripVertical, { className: "mt-3 h-4 w-4 text-ink-muted/50" }), _jsx("div", { className: "flex-1", children: _jsx("input", { value: s.label, onChange: (e) => formik.setFieldValue(`sizes.${i}.label`, e.target.value), placeholder: "e.g. Classic (24 stems)", className: `input ${formik.submitCount && se?.label ? "input-error" : ""}`, "aria-label": `Size ${i + 1} label` }) }), _jsx("div", { className: "w-36", children: _jsx("input", { value: s.price, type: "number", onChange: (e) => formik.setFieldValue(`sizes.${i}.price`, e.target.value), placeholder: "Price", className: `input ${formik.submitCount && se?.price ? "input-error" : ""}`, "aria-label": `Size ${i + 1} price` }) }), _jsx("button", { type: "button", onClick: () => formik.setFieldValue("sizes", formik.values.sizes.filter((_, j) => j !== i)), className: "mt-1 rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600", "aria-label": "Remove size", children: _jsx(X, { className: "h-4 w-4" }) })] }) }, i));
                            }) })] }), _jsxs("section", { className: "flex flex-col divide-y divide-line rounded-2xl border border-line", children: [_jsxs("div", { className: "flex items-center justify-between gap-4 p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-semibold", children: "Visible on the store" }), _jsx("p", { className: "text-[12.5px] text-ink-muted", children: "Hidden products can't be found or bought." })] }), _jsx(Toggle, { label: "Visible on the store", checked: formik.values.isActive, onChange: (v) => formik.setFieldValue("isActive", v) })] }), _jsxs("div", { className: "flex items-center justify-between gap-4 p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-semibold", children: "Curator's pick" }), _jsx("p", { className: "text-[12.5px] text-ink-muted", children: "Featured on the home page." })] }), _jsx(Toggle, { label: "Curator's pick", checked: formik.values.isFeatured, onChange: (v) => formik.setFieldValue("isFeatured", v) })] })] })] })) }));
}
