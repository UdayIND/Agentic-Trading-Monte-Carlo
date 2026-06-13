"use client";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) window.location.href = "/";
    else setError((await res.json()).error ?? "login failed");
  }
  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <form onSubmit={submit} className="border border-zinc-800 rounded-lg p-6 w-80 bg-zinc-950">
        <div className="text-sm font-semibold tracking-wider text-zinc-400 mb-4">COMMAND CENTER · OPERATOR LOGIN</div>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="operator password" autoFocus
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm mono mb-3"
        />
        {error && <div className="text-red-400 text-xs mb-3">{error}</div>}
        <button className="w-full bg-emerald-700 hover:bg-emerald-600 rounded py-2 text-sm font-medium">Sign in</button>
        <div className="text-[10px] text-zinc-600 mt-4">Single-operator access. Passkey/TOTP upgrade planned.</div>
      </form>
    </div>
  );
}
