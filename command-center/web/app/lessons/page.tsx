import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const lessons = await db.lesson.findMany({ orderBy: [{ status: "asc" }, { count: "desc" }] });
  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Lessons Learned</h1>
      <p className="text-xs text-zinc-500">Continuously updated by the AI from post-mortems. A lesson recurring 3× escalates to the quarterly review.</p>
      {lessons.length === 0 && <div className="text-zinc-500 text-sm border border-zinc-800 rounded-lg p-6 text-center">No lessons yet — they come only from real closed trades, never pre-seeded.</div>}
      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l.id} className="border border-zinc-800 rounded p-2 flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-200">{l.text}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{l.category} · {l.status}</div>
            </div>
            <span className={`mono text-xs px-1.5 py-0.5 rounded shrink-0 ${l.count >= 3 ? "bg-amber-900/50 text-amber-400" : "bg-zinc-800 text-zinc-400"}`}>×{l.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
