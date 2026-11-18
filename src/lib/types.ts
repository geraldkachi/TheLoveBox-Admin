export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  isGiftType: boolean;
  order?: number;
}
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  videos: string[];
  categories: { _id: string; name: string; slug?: string }[];
  giftTypes?: { _id: string; name: string }[];
  sizes?: { label: string; price: number }[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  updatedAt?: string;
}
export interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  items: { product: any; name: string; image: string; size: string; price: number; qty: number }[];
  deliveryAddress: string;
  deliveryDate?: string;
  giftMessage?: string;
  promoCode?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paystackReference?: string;
  trackingHistory: { status: string; note?: string; at: string }[];
  createdAt: string;
}
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  statusCounts?: Record<string, number>;
}
