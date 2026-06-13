#!/usr/bin/env python3
"""Agent-side ingest helper: push a daily run's artifacts to the Command
Center with HMAC auth. Called at the end of the 9:00 ET pipeline, after
artifacts are committed to git.

Usage:
  export CC_URL=https://your-cc.vercel.app CC_INGEST_SECRET=...
  python3 tools/ingest_push.py --run-dir runs/2026-06-15 --date 2026-06-15 \
      --regime BULL_VOLATILE --phase 1_paper --commit $(git rev-parse HEAD)

It posts: run -> artifacts (with sha256) -> decision (if DECISION.md parses).
Idempotent: safe to re-run. No broker calls, no order placement.
"""
import argparse, hashlib, hmac, json, os, time, urllib.request, glob

URL = os.environ.get("CC_URL", "").rstrip("/")
SECRET = os.environ.get("CC_INGEST_SECRET", "").encode()

KIND_BY_PREFIX = {
    "MARKET_INTELLIGENCE_REPORT": "INTEL_REPORT", "TOP_OPPORTUNITIES": "TOP_OPPS",
    "BULL": "BULL", "BEAR": "BEAR", "RISK": "RISK", "TRADE_PLAN": "TRADE_PLAN",
    "QUALITY": "QUALITY", "DECISION": "DECISION", "POST_MORTEM": "POST_MORTEM", "HANDOFF": "HANDOFF",
}


def post(path, body):
    raw = json.dumps(body)
    ts = str(int(time.time() * 1000))
    sig = hmac.new(SECRET, (ts + "." + raw).encode(), hashlib.sha256).hexdigest()
    req = urllib.request.Request(URL + path, data=raw.encode(),
        headers={"content-type": "application/json", "x-timestamp": ts, "x-signature": sig}, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def kind_for(filename):
    base = os.path.basename(filename).replace(".md", "")
    for prefix, kind in KIND_BY_PREFIX.items():
        if base.startswith(prefix):
            return kind
    return "OTHER"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--run-dir", required=True)
    p.add_argument("--date", required=True)
    p.add_argument("--regime", required=True)
    p.add_argument("--phase", default="1_paper")
    p.add_argument("--type", default="DAILY")
    p.add_argument("--commit", default=None)
    p.add_argument("--model", default="claude-fable-5")
    a = p.parse_args()
    if not URL or not SECRET:
        raise SystemExit("set CC_URL and CC_INGEST_SECRET")

    now = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    run = post("/api/ingest/run", {
        "date": a.date, "type": a.type, "status": "COMPLETE", "startedAt": now,
        "finishedAt": now, "modelVersion": a.model, "gitCommit": a.commit,
        "phase": a.phase, "regime": a.regime})
    run_id = run["data"]["runId"]
    print("run:", run_id)

    for f in sorted(glob.glob(os.path.join(a.run_dir, "*.md"))):
        content = open(f).read()
        kind = kind_for(f)
        res = post("/api/ingest/artifact", {
            "runId": run_id, "kind": kind, "path": f, "content": content,
            "sha256": hashlib.sha256(content.encode()).hexdigest(), "version": 1, "evidence": []})
        print(f"  {kind}: {res['ok']}")

    # decision (optional, if a structured DECISION.json was emitted alongside)
    dj = os.path.join(a.run_dir, "decision.json")
    if os.path.exists(dj):
        d = json.load(open(dj)); d["runId"] = run_id; d["date"] = a.date
        print("decision:", post("/api/ingest/decision", d)["ok"])
    print("done.")


if __name__ == "__main__":
    main()
