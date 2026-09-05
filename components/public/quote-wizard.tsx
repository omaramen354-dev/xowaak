"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { useI18n } from "@/components/providers";
import { SectionHeading } from "@/components/ui/primitives";
import { estimate, formatEUR, type FeatureKey, type ProjectType, type Speed } from "@/lib/pricing";

const projectTypes: ProjectType[] = ["web", "mobile", "ai", "ecommerce", "erp", "brand"];
const featureKeys: FeatureKey[] = ["auth", "payments", "dashboard", "i18n", "cms", "api", "ai", "realtime"];
const speeds: Speed[] = ["relaxed", "standard", "rush"];

export function QuoteWizard() {
  const { locale, t } = useI18n();
  const [type, setType] = useState<ProjectType>("web");
  const [features, setFeatures] = useState<FeatureKey[]>(["auth", "i18n"]);
  const [speed, setSpeed] = useState<Speed>("standard");
  const [form, setForm] = useState({ name: "", email: "", company: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => estimate(type, features, speed), [type, features, speed]);

  function toggleFeature(key: FeatureKey) {
    setFeatures((prev) => (prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]));
  }

  return (
    <section className="relative overflow-hidden section-y">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] mesh-deep opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 cyber-grid opacity-40 [mask-image:linear-gradient(black,transparent)]" />
      <div className="container-x relative">
        <SectionHeading eyebrow={t.nav.quote} title={t.quote.title} subtitle={t.quote.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.type}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {projectTypes.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={clsx(
                      "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      type === key
                        ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                        : "border-line-strong text-ink-low hover:border-neon-cyan/50",
                    )}
                  >
                    {t.quote.types[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.features}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {featureKeys.map((key) => {
                  const on = features.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleFeature(key)}
                      aria-pressed={on}
                      className={clsx(
                        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start text-sm transition",
                        on
                          ? "border-neon-cyan/50 bg-neon-cyan/10"
                          : "border-line-strong hover:border-neon-cyan/50",
                      )}
                    >
                      <span className="font-medium">{t.quote.features[key]}</span>
                      <CheckCircle2
                        className={clsx("h-4 w-4 shrink-0", on ? "text-neon-cyan" : "text-ink-mid")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.quote.fields.timeline}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {speeds.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSpeed(key)}
                    className={clsx(
                      "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      speed === key
                        ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                        : "border-line-strong text-ink-low hover:border-neon-cyan/50",
                    )}
                  >
                    {t.quote.speeds[key]}
                  </button>
                ))}
              </div>
            </div>

            <form
              className="glass-card space-y-4 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.name}</span>
                  <input
                    required
                    className="field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.email}</span>
                  <input
                    required
                    type="email"
                    className="field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.company}</span>
                <input
                  className="field"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-ink-low">{t.quote.fields.notes}</span>
                <textarea
                  rows={4}
                  className="field resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              <button type="submit" className="btn-primary w-full">
                {t.quote.submit}
              </button>
              {submitted && (
                <p className="rounded-xl border border-neon-emerald/30 bg-neon-emerald/10 px-4 py-3 text-sm font-medium text-neon-emerald">
                  {t.quote.success}
                </p>
              )}
            </form>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="glow-border bg-gradient-to-br from-neon-cyan/[0.09] via-transparent to-neon-indigo/[0.09] p-7">
              <span className="mono-label rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06] px-3 py-1.5">{t.quote.estimate}</span>
              <p className="tabular mt-5 text-4xl font-black text-gradient">
                {formatEUR(result.low, locale)}
              </p>
              <p className="text-sm font-semibold text-ink-low">— {formatEUR(result.high, locale)}</p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-low">
                    <Clock className="h-4 w-4" /> {t.quote.fields.timeline}
                  </dt>
                  <dd className="tabular font-bold">
                    ~{result.weeks} {t.quote.weeks}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-low">
                    <Wallet className="h-4 w-4" /> {t.quote.fields.features}
                  </dt>
                  <dd className="tabular font-bold">{features.length}</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-ink-low">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neon-cyan" />
                    {t.quote.features[f]}
                  </div>
                ))}
              </div>

              <p className="mt-6 border-t border-line pt-4 text-[11px] leading-relaxed text-ink-low">
                {t.quote.disclaimer}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
