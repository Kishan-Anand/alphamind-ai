"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const RESEND_WAIT_SECONDS = 60;

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Too many attempts. Please wait a little before trying again.";
  }
  if (normalized.includes("expired")) {
    return "That code has expired. Request a new code and try again.";
  }
  if (
    normalized.includes("invalid") ||
    normalized.includes("token") ||
    normalized.includes("otp")
  ) {
    return "That code is incorrect or expired. Check it and try again, or request a new one.";
  }
  if (normalized.includes("email")) {
    return "Check the email address and try again.";
  }
  if (normalized.includes("fetch") || normalized.includes("network")) {
    return "Unable to reach the sign-in service. Check your connection and try again.";
  }
  return "We could not complete sign-in right now. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  async function sendOTP() {
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setIsError(true);
      setMessage("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setIsError(false);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });

      if (error) {
        setIsError(true);
        setMessage(friendlyAuthError(error.message));
        if (
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("too many")
        ) {
          setResendSeconds(RESEND_WAIT_SECONDS);
        }
        return;
      }

      setEmail(normalizedEmail);
      setOtpSent(true);
      setOtp("");
      setResendSeconds(RESEND_WAIT_SECONDS);
      setMessage("A 6-digit sign-in code has been sent to your email.");
    } catch {
      setIsError(true);
      setMessage("Unable to reach the sign-in service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    if (!/^\d{6}$/.test(otp)) {
      setIsError(true);
      setMessage("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    setIsError(false);
    setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "email",
      });

      if (error) {
        setIsError(true);
        setMessage(friendlyAuthError(error.message));
        return;
      }

      setMessage("Email verified. Opening your dashboard...");
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setIsError(true);
      setMessage("Unable to verify the code. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/95 p-5 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10 text-2xl font-bold text-green-400">
            A
          </div>
          <h1 className="text-3xl font-bold text-green-400">AlphaMind AI</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your AI-powered stock dashboard
          </p>
        </div>

        {!otpSent ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendOTP();
            }}
          >
            <label htmlFor="login-email" className="mb-2 block text-sm text-zinc-300">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
              className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-green-500 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void verifyOTP();
            }}
          >
            <p className="mb-4 text-sm text-zinc-400">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-white">{email}</span>
            </p>
            <label htmlFor="login-otp" className="sr-only">
              6-digit verification code
            </label>
            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              required
              className="w-full rounded-2xl border border-zinc-800 bg-black px-3 py-4 text-center text-2xl tracking-[0.45em] outline-none transition focus:border-green-500 sm:tracking-[0.6em]"
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="mt-5 w-full rounded-2xl bg-green-500 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setMessage("");
                  setIsError(false);
                  setResendSeconds(0);
                }}
                disabled={loading}
                className="text-zinc-400 transition hover:text-white disabled:opacity-50"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={() => void sendOTP()}
                disabled={loading || resendSeconds > 0}
                className="text-green-400 transition hover:text-green-300 disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                {resendSeconds > 0
                  ? `Resend in ${resendSeconds}s`
                  : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`mt-5 text-center text-sm ${
              isError ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </p>
        )}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Secure passwordless sign-in powered by Supabase
        </p>
      </section>
    </main>
  );
}
