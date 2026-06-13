import { db } from "@/lib/db";
import { calibrationByRole } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ROLES = ["regime", "macro", "technical", "capital_flow", "risk", "portfolio", "execution", "compliance", "evaluator", "session_decision"];

export default async function AgentsPage() {
  const [latest, cal] = await Promise.all([
    db.agentRun.findMany({ orderBy: { id: "desc" }, take: 200 }),
    calibrationByRole(),
  ]);
  const lastByRole = new Map<string, typeof latest[number]>();
  for (const a of latest) if (!lastByRole.has(a.role)) lastByRole.set(a.role, a);

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Agent Monitoring</h1>
      <p className="text-xs text-zinc-500">Each role is checked by a different role, a script, or measured outcomes — including the checkers (calibration).</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ROLES.map((role) => {
          const last = lastByRole.get(role);
          const c = cal.get(role);
          const acc = c && c.n > 0 ? (c.hits / c.n) : null;
          return (
            <div key={role} className="border border-zinc-800 rounded-lg p-3">
              <div className="text-sm font-semibold capitalize">{role.replace("_", " ")}</div>
              <div className="text-xs text-zinc-400 mt-1 mono space-y-0.5">
                <div>last pass: {last?.pass ?? "—"} {last?.verdict ?? ""}</div>
                <div>confidence: {last?.confidence != null ? `${last.confidence}%` : "—"}</div>
                <div>calibration: {acc != null ? `${(acc * 100).toFixed(0)}% (n=${c!.n})` : "no resolved claims"}
                  {acc != null && acc < 0.6 && <span className="text-amber-500"> ⚠ discount active</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
