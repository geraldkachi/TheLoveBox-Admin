import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { api } from "../lib/api";
import { Trash2, UploadCloud, Plus, X, Video as VideoIcon, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  parent: string | null;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  videos: string[];
  categories: { _id: string; name: string }[];
  stock: number;
}

interface FormValues {
  name: string;
  price: string;
  stock: string;
  description: string;
  selectedCategories: { value: string; label: string }[];
  sizes: { label: string; price: string }[];
  files: File[];
}

const selectStyles = {
  control: (base: any) => ({
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
  multiValue: (base: any) => ({ ...base, backgroundColor: "#FBE4E9", borderRadius: "0.375rem" }),
  multiValueLabel: (base: any) => ({ ...base, color: "#211A1D", fontWeight: 500 }),
  menu: (base: any) => ({
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
  sizes: Yup.array().of(
    Yup.object().shape({
      label: Yup.string(),
      price: Yup.number().typeError("Must be a number"),
    })
  ),
});

// Helper component for the image carousel
function ProductCardImage({ product }: { product: Product }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!product.images || product.images.length === 0) {
    return (
      <div className="aspect-square bg-[#FCF8F5] relative flex items-center justify-center text-[#8a7a7d]">
        No Image
      </div>
    );
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  return (
    <div className="aspect-square bg-[#FCF8F5] relative group overflow-hidden">
      <img 
        src={product.images[currentIndex]} 
        alt={product.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      
      {/* Image Counter Badge */}
      {product.images.length > 1 && (
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full z-10">
          {currentIndex + 1}/{product.images.length}
        </span>
      )}

      {/* Video Badge */}
      {product.videos?.length > 0 && (
        <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <VideoIcon className="w-3 h-3" /> Video
        </span>
      )}

      {/* Navigation Buttons */}
      {product.images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-[#2C2523] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md hover:bg-white text-[#2C2523] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const qc = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c._id,
        label: c.parent ? `— ${c.name}` : c.name,
      })),
    [categories]
  );

  const { data } = useQuery<{ items: Product[] }>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products?limit=50")).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("price", values.price);
      fd.append("stock", values.stock);
      fd.append("description", values.description);
      fd.append("categories", JSON.stringify(values.selectedCategories.map((c) => c.value)));
      
      if (values.sizes.length) {
        fd.append(
          "sizes",
          JSON.stringify(
            values.sizes
              .filter((s) => s.label && s.price)
              .map((s) => ({ label: s.label, price: Number(s.price) }))
          )
        );
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
    onError: (e: any) => toast.error(e?.response?.data?.message || "Couldn't add product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product removed.");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const onFilesPicked = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const initialValues: FormValues = {
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
    <div className="min-h-screen bg-[#FCF8F5] pb-12">
      <div className="mb-10">
        <h1 className="font-display text-[32px] font-medium text-[#2C2523] tracking-tight mb-2">Products</h1>
        <p className="text-[15px] text-[#8A7A7D] max-w-xl leading-relaxed">
          Upload items against one or more categories so customers can find them. High-quality images are key.
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          createMutation.mutate(values, {
            onSettled: () => setSubmitting(false),
            onSuccess: () => {
              resetForm();
              setFiles([]);
            }
          } as any);
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="bg-white/80 backdrop-blur-xl border border-[#F2E8E3] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 flex flex-col gap-6 mb-12 relative overflow-hidden">
            
            {/* Decorative gradient background element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FBE4E9]/20 to-transparent rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
                  Product Name
                </label>
                <Field
                  name="name"
                  placeholder="e.g. Luxury Rose Bouquet"
                  className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-[12px] mt-1.5 font-medium" />
              </div>
              <div>
                <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
                  Price (NGN)
                </label>
                <Field
                  name="price"
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
                />
                <ErrorMessage name="price" component="div" className="text-red-500 text-[12px] mt-1.5 font-medium" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
                  Categories <span className="text-[#B0A2A5] font-normal lowercase tracking-normal">(pick as many as apply)</span>
                </label>
                <Select
                  isMulti
                  styles={selectStyles}
                  options={categoryOptions}
                  value={values.selectedCategories}
                  onChange={(v) => setFieldValue("selectedCategories", v)}
                  placeholder="Search categories..."
                />
                <ErrorMessage name="selectedCategories" component="div" className="text-red-500 text-[12px] mt-1.5 font-medium" />
              </div>
              <div>
                <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
                  Stock
                </label>
                <Field
                  name="stock"
                  type="number"
                  placeholder="0"
                  className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
                />
                <ErrorMessage name="stock" component="div" className="text-red-500 text-[12px] mt-1.5 font-medium" />
              </div>
            </div>

            <div>
              <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                placeholder="Describe the product..."
                rows={3}
                className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300 resize-none"
              />
            </div>

            {/* Sizes Section */}
            <div className="bg-[#FCF8F5]/50 p-4 rounded-2xl border border-[#F2E8E3]">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase">
                  Sizes <span className="text-[#B0A2A5] font-normal lowercase tracking-normal">(optional — leave empty for a single price)</span>
                </label>
              </div>
              
              <FieldArray name="sizes">
                {({ push, remove }) => (
                  <div className="flex flex-col gap-3">
                    {values.sizes.map((_, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <Field
                            name={`sizes[${i}].label`}
                            placeholder="e.g. Small (15 Roses)"
                            className="w-full bg-white border border-[#F2E8E3] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-pink focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
                          />
                        </div>
                        <div className="w-32">
                          <Field
                            name={`sizes[${i}].price`}
                            type="number"
                            placeholder="Price"
                            className="w-full bg-white border border-[#F2E8E3] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-pink focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
                          />
                        </div>
                        <button type="button" onClick={() => remove(i)} className="text-[#D1C5C7] hover:text-red-500 bg-white p-2 rounded-xl border border-[#F2E8E3] hover:bg-red-50 transition-colors mt-0.5">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => push({ label: "", price: "" })} className="flex items-center justify-center gap-1.5 text-[13px] text-brand-pink font-semibold mt-1 py-2.5 border-2 border-dashed border-[#FBE4E9] rounded-xl hover:bg-[#FDF1F4] transition-colors w-full">
                      <Plus className="w-4 h-4" /> Add another size
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#F2E8E3] bg-[#FCF8F5]/50 rounded-2xl px-6 py-8 text-center cursor-pointer hover:border-brand-pink hover:bg-[#FDF1F4]/50 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5 text-brand-pink" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#2C2523]">Click to upload media</p>
                  <p className="text-[12px] text-[#8A7A7D] mt-1">Images or short videos (max 40MB each)</p>
                </div>
                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onFilesPicked(e.target.files)} />
              </label>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {files.map((f, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#F2E8E3] bg-white shadow-sm group">
                      {f.type.startsWith("video/") ? (
                        <div className="w-full h-full flex items-center justify-center bg-[#FCF8F5] text-brand-pink">
                          <VideoIcon className="w-6 h-6" />
                        </div>
                      ) : (
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="mt-2 bg-gradient-to-r from-brand-pink to-[#A61D47] text-white rounded-xl py-3.5 text-[15px] font-semibold shadow-[0_4px_14px_rgba(196,39,92,0.3)] hover:shadow-[0_6px_20px_rgba(196,39,92,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting || createMutation.isPending ? "Adding..." : "Add Product"}
            </button>
          </Form>
        )}
      </Formik>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.items?.map((p) => (
          <div key={p._id} className="bg-white border border-[#F2E8E3] rounded-2xl overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
            
            <ProductCardImage product={p} />

            <div className="p-4">
              <div className="mb-3">
                <p className="text-[15px] font-medium text-[#2C2523] truncate group-hover:text-brand-pink transition-colors">{p.name}</p>
                <p className="text-[12px] text-[#8A7A7D] truncate mt-0.5">
                  {p.categories?.map((c) => c.name).join(", ")}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#F2E8E3]">
                <span className="text-[15px] font-semibold text-[#2C2523]">₦{p.price?.toLocaleString()}</span>
                <button 
                  onClick={() => {
                    if(window.confirm("Are you sure you want to delete this product?")) {
                      deleteMutation.mutate(p._id);
                    }
                  }} 
                  className="text-[#D1C5C7] hover:text-red-500 bg-transparent hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}