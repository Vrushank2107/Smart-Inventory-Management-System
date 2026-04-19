import { getActiveDiscountRules } from "@/repositories/discountRuleRepository";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const rules = await getActiveDiscountRules();

  return (
    <section className="space-y-5">
      <header className="glass-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Discount Catalog</p>
        <h1 className="mt-2 text-3xl font-bold">Active Offers & Rule Priorities</h1>
        <p className="mt-2 text-slate-300">These active rules are evaluated by the engine to compute the best outcome.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {rules.map((rule) => (
          <article key={rule.id} className="glass-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{rule.name}</h2>
              <span className="rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs text-cyan-300">P{rule.priority}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>Type: {rule.type}</p>
              <p>Value: {Number(rule.value)}</p>
              <p>Combinable: {rule.combinable ? "Yes" : "No"}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
