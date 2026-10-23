import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { api } from "../lib/api";
import { Trash2, UploadCloud, Plus, X, Video as VideoIcon, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
const selectStyles = {
    control: (base) => ({
        ...base,
        backgroundColor: "#FCF8F5",
        borderColor: "#F2E8E3",
        borderRadius: "0.75rem",
        minHeight: "46px",
        fontSize: "14px",
        boxShadow: "none",
        "&:hover": { borderColor: "#C4275C" },
        "&:focus-within": { borderColor: "#C4275C", backgroundColor: "#fff" },
    }),
    multiValue: (base) => ({ ...base, backgroundColor: "#FBE4E9", borderRadius: "0.375rem" }),
    multiValueLabel: (base) => ({ ...base, color: "#211A1D", fontWeight: 500 }),
    menu: (base) => ({
        ...base,
        borderRadius: "0.75rem",
        overflow: "hidden",
        boxShadow: "0_8px_30px_rgb(0,0,0,0.08)",
    }),
};
const validationSchema = Yup.object().shape({
    name: Yup.string().required("Product name is required"),
    price: Yup.number().typeError("Price must be a number").required("Price is required").min(1, "Price must be greater than 0"),
    stock: Yup.number().typeError("Stock must be a number").required("Stock is required").min(0, "Stock cannot be negative"),
    selectedCategories: Yup.array().min(1, "Select at least one category").required("Category is required"),
    sizes: Yup.array().of(Yup.object().shape({
        label: Yup.string(),
        price: Yup.number().typeError("Must be a number"),
    })),
});
// Helper component for the image carousel
function ProductCardImage({ product }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!product.images || product.images.length === 0) {
        return (_jsx("div", { className: "aspect-square bg-[#FCF8F5] relative flex items-center justify-center text-[#8a7a7d]", children: "No Image" }));
    }
    const nextImage = (e) => {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % product.images.length);
    };
    const prevImage = (e) => {
        e.preventDefault();
        setCurrentIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };
    return (_jsxs("div", { className: "aspect-square bg-[#FCF8F5] relative group overflow-hidden", children: [_jsx("img", { src: product.images[currentIndex], alt: product.name, className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" }), product.images.length > 1 && (_jsxs("span", { className: "absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full z-10", children: [currentIndex + 1, "/", product.images.length] })), product.videos?.length > 0 && (_jsxs("span", { className: "absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1 z-10", children: [_jsx(VideoIcon, { className: "w-3 h-3" }), " Video"] })), product.images.length > 1 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: prevImage, className: "absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-[#2C2523] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx("button", { onClick: nextImage, className: "absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-[#2C2523] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }))] }));
}
export default function Products() {
    const qc = useQueryClient();
    const [files, setFiles] = useState([]);
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data,
    });
    const categoryOptions = useMemo(() => categories.map((c) => ({
        value: c._id,
        label: c.parent ? `— ${c.name}` : c.name,
    })), [categories]);
    const { data } = useQuery({
        queryKey: ["products"],
        queryFn: async () => (await api.get("/products?limit=50")).data,
    });
    const createMutation = useMutation({
        mutationFn: (values) => {
            const fd = new FormData();
            fd.append("name", values.name);
            fd.append("price", values.price);
            fd.append("stock", values.stock);
            fd.append("description", values.description);
            fd.append("categories", JSON.stringify(values.selectedCategories.map((c) => c.value)));
            if (values.sizes.length) {
                fd.append("sizes", JSON.stringify(values.sizes
                    .filter((s) => s.label && s.price)
                    .map((s) => ({ label: s.label, price: Number(s.price) }))));
            }
            files.forEach((f) => fd.append("media", f));
            return api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        },
        onSuccess: (response) => {
            const createdProduct = response.data;
            toast.success(`"${createdProduct.name}" added successfully!`);
            setFiles([]);
            qc.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Couldn't add product."),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            toast.success("Product removed.");
            qc.invalidateQueries({ queryKey: ["products"] });
        },
    });
    const onFilesPicked = (fileList) => {
        if (!fileList)
            return;
        setFiles((prev) => [...prev, ...Array.from(fileList)]);
    };
    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
    const initialValues = {
        name: "",
        price: "",
        stock: "10",
        description: "",
        selectedCategories: [],
        sizes: [],
        files: [],
    };
    return (
    // Ambient warm background
    _jsxs("div", { className: "min-h-screen bg-[#FCF8F5] pb-12", children: [_jsxs("div", { className: "mb-10", children: [_jsx("h1", { className: "font-display text-[32px] font-medium text-[#2C2523] tracking-tight mb-2", children: "Products" }), _jsx("p", { className: "text-[15px] text-[#8A7A7D] max-w-xl leading-relaxed", children: "Upload items against one or more categories so customers can find them. High-quality images are key." })] }), _jsx(Formik, { initialValues: initialValues, validationSchema: validationSchema, onSubmit: (values, { setSubmitting, resetForm }) => {
                    createMutation.mutate(values, {
                        onSettled: () => setSubmitting(false),
                        onSuccess: () => {
                            resetForm();
                            setFiles([]);
                        }
                    });
                }, children: ({ values, setFieldValue, isSubmitting }) => (_jsxs(Form, { className: "bg-white/80 backdrop-blur-xl border border-[#F2E8E3] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 flex flex-col gap-6 mb-12 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FBE4E9]/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block", children: "Product Name" }), _jsx(Field, { name: "name", placeholder: "e.g. Luxury Rose Bouquet", className: "w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300" }), _jsx(ErrorMessage, { name: "name", component: "div", className: "text-red-500 text-[12px] mt-1.5 font-medium" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block", children: "Price (NGN)" }), _jsx(Field, { name: "price", type: "number", placeholder: "0.00", className: "w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300" }), _jsx(ErrorMessage, { name: "price", component: "div", className: "text-red-500 text-[12px] mt-1.5 font-medium" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsxs("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block", children: ["Categories ", _jsx("span", { className: "text-[#B0A2A5] font-normal lowercase tracking-normal", children: "(pick as many as apply)" })] }), _jsx(Select, { isMulti: true, styles: selectStyles, options: categoryOptions, value: values.selectedCategories, onChange: (v) => setFieldValue("selectedCategories", v), placeholder: "Search categories..." }), _jsx(ErrorMessage, { name: "selectedCategories", component: "div", className: "text-red-500 text-[12px] mt-1.5 font-medium" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block", children: "Stock" }), _jsx(Field, { name: "stock", type: "number", placeholder: "0", className: "w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300" }), _jsx(ErrorMessage, { name: "stock", component: "div", className: "text-red-500 text-[12px] mt-1.5 font-medium" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block", children: "Description" }), _jsx(Field, { as: "textarea", name: "description", placeholder: "Describe the product...", rows: 3, className: "w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300 resize-none" })] }), _jsxs("div", { className: "bg-[#FCF8F5]/50 p-4 rounded-2xl border border-[#F2E8E3]", children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("label", { className: "text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase", children: ["Sizes ", _jsx("span", { className: "text-[#B0A2A5] font-normal lowercase tracking-normal", children: "(optional \u2014 leave empty for a single price)" })] }) }), _jsx(FieldArray, { name: "sizes", children: ({ push, remove }) => (_jsxs("div", { className: "flex flex-col gap-3", children: [values.sizes.map((_, i) => (_jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("div", { className: "flex-1", children: _jsx(Field, { name: `sizes[${i}].label`, placeholder: "e.g. Small (15 Roses)", className: "w-full bg-white border border-[#F2E8E3] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-pink focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300" }) }), _jsx("div", { className: "w-32", children: _jsx(Field, { name: `sizes[${i}].price`, type: "number", placeholder: "Price", className: "w-full bg-white border border-[#F2E8E3] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-pink focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300" }) }), _jsx("button", { type: "button", onClick: () => remove(i), className: "text-[#D1C5C7] hover:text-red-500 bg-white p-2 rounded-xl border border-[#F2E8E3] hover:bg-red-50 transition-colors mt-0.5", children: _jsx(X, { className: "w-4 h-4" }) })] }, i))), _jsxs("button", { type: "button", onClick: () => push({ label: "", price: "" }), className: "flex items-center justify-center gap-1.5 text-[13px] text-brand-pink font-semibold mt-1 py-2.5 border-2 border-dashed border-[#FBE4E9] rounded-xl hover:bg-[#FDF1F4] transition-colors w-full", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add another size"] })] })) })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#F2E8E3] bg-[#FCF8F5]/50 rounded-2xl px-6 py-8 text-center cursor-pointer hover:border-brand-pink hover:bg-[#FDF1F4]/50 transition-all duration-300 group", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", children: _jsx(UploadCloud, { className: "w-5 h-5 text-brand-pink" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-medium text-[#2C2523]", children: "Click to upload media" }), _jsx("p", { className: "text-[12px] text-[#8A7A7D] mt-1", children: "Images or short videos (max 40MB each)" })] }), _jsx("input", { type: "file", multiple: true, accept: "image/*,video/*", className: "hidden", onChange: (e) => onFilesPicked(e.target.files) })] }), files.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3 mt-4", children: files.map((f, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-xl overflow-hidden border border-[#F2E8E3] bg-white shadow-sm group", children: [f.type.startsWith("video/") ? (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-[#FCF8F5] text-brand-pink", children: _jsx(VideoIcon, { className: "w-6 h-6" }) })) : (_jsx("img", { src: URL.createObjectURL(f), alt: "", className: "w-full h-full object-cover" })), _jsx("button", { type: "button", onClick: () => removeFile(i), className: "absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200", children: _jsx(X, { className: "w-3 h-3" }) })] }, i))) }))] }), _jsx("button", { type: "submit", disabled: isSubmitting || createMutation.isPending, className: "mt-2 bg-gradient-to-r from-brand-pink to-[#A61D47] text-white rounded-xl py-3.5 text-[15px] font-semibold shadow-[0_4px_14px_rgba(196,39,92,0.3)] hover:shadow-[0_6px_20px_rgba(196,39,92,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0", children: isSubmitting || createMutation.isPending ? "Adding..." : "Add Product" })] })) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", children: data?.items?.map((p) => (_jsxs("div", { className: "bg-white border border-[#F2E8E3] rounded-2xl overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300", children: [_jsx(ProductCardImage, { product: p }), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-[15px] font-medium text-[#2C2523] truncate group-hover:text-brand-pink transition-colors", children: p.name }), _jsx("p", { className: "text-[12px] text-[#8A7A7D] truncate mt-0.5", children: p.categories?.map((c) => c.name).join(", ") })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-[#F2E8E3]", children: [_jsxs("span", { className: "text-[15px] font-semibold text-[#2C2523]", children: ["\u20A6", p.price?.toLocaleString()] }), _jsx("button", { onClick: () => {
                                                if (window.confirm("Are you sure you want to delete this product?")) {
                                                    deleteMutation.mutate(p._id);
                                                }
                                            }, className: "text-[#D1C5C7] hover:text-red-500 bg-transparent hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100", title: "Delete product", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] })] }, p._id))) })] }));
}
