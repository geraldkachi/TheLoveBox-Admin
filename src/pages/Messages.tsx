import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Phone, Reply } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { timeAgo, dateTime } from "../lib/format";
import { Button, EmptyState, PageHeader, Skeleton } from "../components/ui";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export default function Messages() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data = [], isLoading, isError, error, refetch } = useQuery<Inquiry[]>({
    queryKey: ["inquiries"],
    queryFn: async () => (await api.get("/contact")).data,
  });

  return (
    <div>
      <PageHeader title="Messages" sub="Questions and corporate briefs sent from the store's contact page." />
      <div className="card overflow-hidden">
        {isError ? (
          <EmptyState icon={Mail} title="Couldn't load messages" body={errorMessage(error)} action={<Button onClick={() => refetch()}>Try again</Button>} />
        ) : isLoading ? (
          <div className="flex flex-col gap-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : !data.length ? (
          <EmptyState icon={Mail} title="No messages yet" body="When someone writes in from the contact page, it lands here." />
        ) : (
          <ul>
            {data.map((m) => {
              const open = openId === m._id;
              return (
                <li key={m._id} className="border-t border-line first:border-t-0">
                  <button onClick={() => setOpenId(open ? null : m._id)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-cream-50/60" aria-expanded={open}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream-100 font-semibold text-primary-700">{m.name.charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{m.name}</span>
                        <span className="shrink-0 text-[12.5px] text-ink-muted" title={dateTime(m.createdAt)}>{timeAgo(m.createdAt)}</span>
                      </span>
                      <span className={`block text-[14px] text-ink-soft ${open ? "" : "truncate"}`}>{m.message}</span>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="flex flex-wrap gap-2 px-5 pb-4 pl-[76px]">
                          <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to The Love Box")}`} className="inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white hover:bg-ink-soft"><Reply className="h-4 w-4" /> Reply by email</a>
                          <span className="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-[13.5px]"><Mail className="h-4 w-4 text-ink-muted" />{m.email}</span>
                          {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-[13.5px]"><Phone className="h-4 w-4 text-ink-muted" />{m.phone}</a>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
