import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; phone: string };
  total: number;
  status: string;
  createdAt: string;
}

const statuses = ["pending_payment", "paid", "processing", "out_for_delivery", "delivered", "cancelled"];

export default function Orders() {
  const qc = useQueryClient();
  const { data } = useQuery<{ items: Order[] }>({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders?limit=50")).data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Order status updated.");
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-[26px] text-brand-ink mb-1">Orders</h1>
      <p className="text-[14px] text-[#8a7a7d] mb-8">Update status here — customers see it live on their tracking page.</p>

      <div className="bg-white border border-brand-blush rounded-2xl overflow-hidden">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="text-left text-[#8a7a7d] border-b border-brand-blush">
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((o) => (
              <tr key={o._id} className="border-b border-brand-blush last:border-0">
                <td className="px-5 py-3 text-brand-ink font-medium">{o.orderNumber}</td>
                <td className="px-5 py-3">{o.customer?.name}</td>
                <td className="px-5 py-3">₦{o.total?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o._id, status: e.target.value })}
                    className="border border-brand-blush rounded-lg px-2 py-1 text-[13px] outline-none focus:border-brand-pink"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
