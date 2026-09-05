"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LoaderCircle, Send, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

const projectTypes = [
  { value: "brand", label: "هوية رقمية" },
  { value: "website", label: "موقع تجريبي" },
  { value: "platform", label: "منصة / SaaS" },
  { value: "commerce", label: "تجارة إلكترونية" },
  { value: "ai", label: "منتج AI" },
  { value: "other", label: "فكرة أخرى" },
];

const budgets = [
  { value: "10-25", label: "€10K — €25K" },
  { value: "25-50", label: "€25K — €50K" },
  { value: "50-100", label: "€50K — €100K" },
  { value: "100+", label: "+€100K" },
];

type SubmitState = "idle" | "loading" | "success" | "error";

export function ProjectLauncher() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [projectType, setProjectType] = useState("platform");
  const [budget, setBudget] = useState("25-50");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company"),
      details: form.get("details"),
      projectType,
      budget,
    };

    try {
      const response = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "تعذر إرسال الطلب.");
      setState("success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ غير متوقع.");
      setState("error");
    }
  }

  return (
    <div className="launcher-shell">
      <div className="launcher-topbar" aria-hidden="true">
        <span className="terminal-dot terminal-dot-red" />
        <span className="terminal-dot terminal-dot-yellow" />
        <span className="terminal-dot terminal-dot-green" />
        <span className="launcher-path" dir="ltr">awwa://launch/new-project</span>
        <span className="launcher-live"><i /> CHANNEL OPEN</span>
      </div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            className="launcher-success"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="success-orbit" aria-hidden="true">
              <CheckCircle2 size={42} strokeWidth={1.4} />
            </div>
            <p className="eyebrow">TRANSMISSION RECEIVED</p>
            <h3>وصلت إشارتك بنجاح.</h3>
            <p>سنحلّل تفاصيل المشروع ونتواصل معك خلال يوم عمل واحد بخريطة طريق أولية.</p>
            <button type="button" className="button button-ghost" onClick={() => setState("idle")}>
              إرسال مشروع آخر
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="launcher-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow"><Sparkles size={14} /> ابدأ الإطلاق</p>
                <h3>أخبرنا ماذا سنبني معًا.</h3>
              </div>
              <span className="form-step" dir="ltr">01 / BRIEF</span>
            </div>

            <fieldset className="option-fieldset">
              <legend>نوع المشروع</legend>
              <div className="option-grid project-options">
                {projectTypes.map((type) => (
                  <label key={type.value} className={projectType === type.value ? "option active" : "option"}>
                    <input
                      type="radio"
                      name="projectType"
                      value={type.value}
                      checked={projectType === type.value}
                      onChange={() => setProjectType(type.value)}
                    />
                    <span className="option-indicator" />
                    {type.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="option-fieldset">
              <legend>الميزانية التقريبية</legend>
              <div className="option-grid budget-options" dir="ltr">
                {budgets.map((item) => (
                  <label key={item.value} className={budget === item.value ? "option active" : "option"}>
                    <input
                      type="radio"
                      name="budget"
                      value={item.value}
                      checked={budget === item.value}
                      onChange={() => setBudget(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field-grid">
              <label className="field-label">
                <span>الاسم *</span>
                <input className="field" name="name" minLength={2} maxLength={120} required placeholder="كيف نناديك؟" />
              </label>
              <label className="field-label">
                <span>البريد الإلكتروني *</span>
                <input className="field" name="email" type="email" maxLength={180} required placeholder="you@company.com" dir="ltr" />
              </label>
            </div>

            <label className="field-label">
              <span>الشركة <small>اختياري</small></span>
              <input className="field" name="company" maxLength={160} placeholder="اسم الشركة أو العلامة" />
            </label>

            <label className="field-label">
              <span>صف الفكرة *</span>
              <textarea
                className="field textarea"
                name="details"
                minLength={12}
                maxLength={4000}
                required
                placeholder="الهدف، الجمهور، المشكلة التي نحلها، والموعد المتوقع..."
              />
            </label>

            <div className="launcher-actions">
              {state === "error" ? (
                <p className="form-error" role="alert" aria-live="polite">
                  {message}
                </p>
              ) : (
                <span className="launcher-hint" dir="ltr">ENCRYPTED CHANNEL — NO SPAM, EVER</span>
              )}
              <button className="button button-primary launcher-submit" type="submit" disabled={state === "loading"}>
                {state === "loading" ? (
                  <><LoaderCircle className="spin" size={18} /> جارٍ الإرسال...</>
                ) : (
                  <>إرسال الإشارة <Send size={17} /></>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
