"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthDemoPageProps = {
  title: string;
  intro: string;
  steps: string[];
  children: ReactNode;
};

export function AuthDemoPage({
  title,
  intro,
  steps,
  children,
}: AuthDemoPageProps) {
  return (
    <div className="flex min-h-screen flex-col text-slate-900 dark:text-slate-100">
      <header className="border-b border-gray-200 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              EchoBase
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-purple-400/50 dark:text-purple-400/50 transition hover:text-purple-400/80 dark:hover:text-purple-400/80"
          >
            Back home →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[32px] border border-gray-200 dark:border-white/30 p-8 shadow-[0_18px_40px_rgba(2,6,23,0.35)]">
            <p className="text-lg font-medium text-slate-900 dark:text-white/90">
              {intro}
            </p>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
