import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="glass-card relative overflow-hidden p-7 md:p-10">
        <div className="pointer-events-none absolute -top-16 right-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Intelligent Commerce Platform</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Modern inventory management with a smart discount decision engine
          </h1>
          <p className="text-slate-300">
            Browse inventory, build your cart, and instantly see the best possible discounted price based on active
            business rules.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/inventory" className="btn-primary">
              Explore Inventory
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold">Inventory First</h2>
          <p className="mt-2 text-sm text-slate-300">Users start from a dedicated catalog page to discover products.</p>
        </article>
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold">Smart Cart Pricing</h2>
          <p className="mt-2 text-sm text-slate-300">
            Cart automatically recalculates total, discount, and final payable amount in real time.
          </p>
        </article>
        <article className="glass-card p-5">
          <h2 className="text-lg font-semibold">Transparent Decisions</h2>
          <p className="mt-2 text-sm text-slate-300">
            Every discount decision is explained so users understand why a final price was chosen.
          </p>
        </article>
      </div>
    </section>
  );
}
