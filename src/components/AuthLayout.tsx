export default function AuthLayout({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-cream-100 p-12 lg:flex">
        <div className="absolute -left-24 top-1/3 h-[420px] w-[620px] rotate-[-8deg] rounded-[50%] bg-gold-200/60 blur-2xl" aria-hidden="true" />
        <img src="/brand/logo-full.png" alt="The Love Box — unique gift box curator" className="relative w-56" />
        <p className="relative max-w-sm font-script text-[44px] leading-[1.05] text-ink">Every box that leaves the studio starts here.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <img src="/brand/logo-mark.png" alt="" className="mb-8 h-12 lg:hidden" />
          <h1 className="text-[28px] font-bold tracking-[-0.02em]">{title}</h1>
          <p className="mb-8 mt-2 text-[15px] text-ink-muted">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
