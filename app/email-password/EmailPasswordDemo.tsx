"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { AuthDemoPage } from "@/components/AuthDemoPage";
import { useRouter, useSearchParams } from "next/navigation";

type EmailPasswordDemoProps = {
  user: User | null;
};

type Mode = "signup" | "signin";

export default function EmailPasswordDemo({ user }: EmailPasswordDemoProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const supabase = getSupabaseBrowserClient();
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };
  const didShowInitial = useRef(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  // Handle query param prompts (e.g., after sign out)
  useEffect(() => {
    const reason = searchParams?.get("reason");
    if (reason === "signedout") {
      showToast("Signed out. Please sign in again.");
      setMode("signin");
      // clean the URL to avoid repeated toasts
      router.replace("/email-password");
    }
  }, [searchParams, router]);

  // Toast when page already has a logged-in user
  useEffect(() => {
    if (!didShowInitial.current && user) {
      didShowInitial.current = true;
      showToast("You're signed in");
    }
  }, [user]);

  // On successful sign-in, redirect to home
  useEffect(() => {
    if (currentUser) {
      showToast("Signed in successfully");
      router.replace("/");
    }
  }, [currentUser, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/email-password` },
      });
      if (error) {
        setStatus(error.message);
      } else {
        setStatus("Account created. Please sign in with your new credentials.");
        setMode("signin");
        // Ensure we are on the auth page
        router.replace("/email-password");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setStatus(error ? error.message : "Signed in successfully");
    }
  }

  return (
    <AuthDemoPage
      title="Home of ChatBots"
      intro="Classic credentials—users enter details; the UI stays minimal and focused."
      steps={["Toggle between sign up and sign in.", "Submit the form."]}
    >
      {!currentUser && (
        <form
          className="rounded-2xl border border-emerald-500/60 p-8 text-slate-100 shadow"
          onSubmit={handleSubmit}
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h3>
            <div className="flex rounded-full border border-white/10 p-1 text-xs font-semibold text-slate-300">
              {(["signup", "signin"] as Mode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                  className={`rounded-full px-4 py-1 transition ${
                    mode === option ? "bg-emerald-500/30 text-white" : "text-slate-400"
                  }`}
                >
                  {option === "signup" ? "Sign up" : "Sign in"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-200">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-base text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="you@email.com"
              />
            </label>
            <label className="block text-sm font-medium text-slate-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-base text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                placeholder="At least 6 characters"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-600/40"
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {status && (
            <p className="mt-4 text-sm text-slate-300" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </form>
      )}

      {toast && (
        <div className="fixed right-6 top-16 z-50 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-[0_12px_28px_rgba(2,6,23,0.25)]">
          {toast}
        </div>
      )}
    </AuthDemoPage>
  );
}