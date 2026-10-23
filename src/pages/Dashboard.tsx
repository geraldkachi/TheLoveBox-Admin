import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Package, Tags, ClipboardList, TrendingUp, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });
  const { data: products } = useQuery({
    queryKey: ["products", "count"],
    queryFn: async () => (await api.get("/products?limit=1")).data,
  });
  const { data: orders } = useQuery({
    queryKey: ["orders", "count"],
    queryFn: async () => (await api.get("/orders?limit=50")).data, // fetch more for graph
  });

  // Mock Data for Graph (Replace with real order data parsing later)
  const graphData = [
    { name: 'Mon', revenue: 45000 },
    { name: 'Tue', revenue: 52000 },
    { name: 'Wed', revenue: 38000 },
    { name: 'Thu', revenue: 65000 },
    { name: 'Fri', revenue: 89000 },
    { name: 'Sat', revenue: 120000 },
    { name: 'Sun', revenue: 95000 },
  ];

  const totalRevenue = orders?.items?.reduce((sum: number, order: any) => {
    return order.status === "paid" || order.status === "delivered" ? sum + order.total : sum;
  }, 0) || 0;

  const stats = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Products", value: products?.total ?? "—", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Orders", value: orders?.total ?? "—", icon: ClipboardList, color: "text-brand-pink", bg: "bg-[#FDF1F4]" },
    { label: "Categories", value: categories?.length ?? "—", icon: Tags, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FCF8F5] pb-12">
      <div className="mb-10">
        <h1 className="font-display text-[32px] font-medium text-[#2C2523] tracking-tight mb-2">Dashboard</h1>
        <p className="text-[15px] text-[#8A7A7D] max-w-xl">Here's what's happening at The Love Box today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-[#F2E8E3] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[13px] text-[#8A7A7D] font-medium mb-1">{label}</p>
              <p className="text-[24px] font-semibold text-[#2C2523]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Graph */}
      <div className="bg-white border border-[#F2E8E3] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[18px] font-semibold text-[#2C2523]">Revenue Overview</h2>
            <p className="text-[13px] text-[#8A7A7D]">Daily performance over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-[13px] font-medium">
            <TrendingUp className="w-4 h-4" /> +12.5%
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4275C" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#C4275C" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2E8E3" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8A7A7D', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#8A7A7D', fontSize: 12}} tickFormatter={(val) => `₦${val/1000}k`} />
               
              {/* FIXED TOOLTIP */}
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                formatter={(value: any) => [
                  typeof value === 'number' ? `₦${value.toLocaleString()}` : `₦0`, 
                  'Revenue'
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C4275C" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}