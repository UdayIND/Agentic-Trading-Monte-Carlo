"use client";
import { useState } from "react";

export function ApprovalActions({ tradeId }: { tradeId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");

  async function act(kind: "approve" | "reject" | "challenge") {
    if ((kind === "reject" || kind === "challenge") && !note.trim()) {
      setMsg(`${kind} requires a note`); return;
    }
    setBusy(true); setMsg("");
    const res = await fetch(`/api/trades/${tradeId}/${kind}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const j = await res.json();
    if (res.ok) { setMsg(`${kind}d ✓`); setTimeout(() => location.reload(), 600); }
    else { setMsg(j.error ?? "failed"); setBusy(false); }
  }

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="note (required to reject/challenge)…"
        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs"
        rows={2}
      />
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => act("approve")} className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold disabled:opacity-50">✓ Approve</button>
        <button disabled={busy} onClick={() => act("reject")} className="px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-xs font-semibold disabled:opacity-50">✗ Reject</button>
        <button disabled={busy} onClick={() => act("challenge")} className="px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-xs font-semibold disabled:opacity-50">? Challenge</button>
        {msg && <span className="text-xs text-zinc-400 self-center">{msg}</span>}
      </div>
    </div>
  );
}
