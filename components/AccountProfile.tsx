"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AccountProfile() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void supabase.auth.getUser().then(({ data, error: userError }) => {
        if (userError) {
          setError("Could not load your account details. Please refresh the page.");
        } else {
          setEmail(data.user?.email ?? "");
        }
        setLoading(false);
      }).catch(() => {
        setError("Could not reach the sign-in service. Please refresh the page.");
        setLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError("Could not sign out. Please try again.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const username = email ? email.split("@")[0] : "";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      <div className="mt-6 space-y-4">
        <div>
          <p className="text-zinc-400">Username</p>
          <input
            type="text"
            value={loading ? "Loading..." : username}
            className="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none"
            readOnly
          />
        </div>
        <div>
          <p className="text-zinc-400">Email</p>
          <input
            type="email"
            value={loading ? "Loading..." : email}
            className="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 outline-none"
            readOnly
          />
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-3 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {signingOut ? "Signing out..." : "Log out"}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
