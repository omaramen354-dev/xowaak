"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { loginAction, registerAction, type ActionState } from "@/app/actions/auth";
import { useI18n } from "@/components/providers";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = { ok: false, message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-400">{message}</p>;
}

export function LoginForm() {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="glass-card space-y-5 p-7">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h1 className="text-2xl font-bold text-ink-hi">{t.auth.loginTitle}</h1>
        <p className="mt-1.5 text-sm text-ink-low" dir="auto">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {state.message && !state.ok ? (
        <Alert role="alert" className="border-rose-500/40 bg-rose-500/10">
          <AlertDescription className="text-rose-200">{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.email}
        </Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="field" dir="ltr" />
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.password}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field"
          dir="ltr"
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {pending ? t.auth.submitting : t.auth.signIn}
      </Button>

      <p className="text-center text-sm text-ink-low">
        {t.auth.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-semibold text-neon-cyan hover:underline">
          {t.auth.signUp}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const { t, locale } = useI18n();
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="glass-card space-y-5 p-7">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <h1 className="text-2xl font-bold text-ink-hi">{t.auth.registerTitle}</h1>
        <p className="mt-1.5 text-sm text-ink-low" dir="auto">
          {t.auth.registerSubtitle}
        </p>
      </div>

      {state.message && !state.ok ? (
        <Alert role="alert" className="border-rose-500/40 bg-rose-500/10">
          <AlertDescription className="text-rose-200">{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <Label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.name}
        </Label>
        <Input id="name" name="name" required autoComplete="name" className="field" dir="auto" />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold text-ink-low">
            {t.auth.email}
          </Label>
          <Input id="reg-email" name="email" type="email" required autoComplete="email" className="field" dir="ltr" />
          <FieldError message={state.fieldErrors?.email} />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-ink-low">
            {t.auth.phone}
          </Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" className="field" dir="ltr" />
        </div>
      </div>

      <div>
        <Label htmlFor="company" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.company}
        </Label>
        <Input id="company" name="company" autoComplete="organization" className="field" dir="auto" />
      </div>

      <div>
        <Label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold text-ink-low">
          {t.auth.password}
        </Label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          dir="ltr"
        />
        <p className="mt-1 text-xs text-ink-low">{t.auth.passwordHint}</p>
        <FieldError message={state.fieldErrors?.password} />
      </div>

      <Button type="submit" disabled={pending} className="w-full gap-2">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? t.auth.submitting : t.auth.signUp}
      </Button>

      <p className="text-center text-sm text-ink-low">
        {t.auth.haveAccount}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-neon-cyan hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
