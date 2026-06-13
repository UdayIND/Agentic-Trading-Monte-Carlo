#!/usr/bin/env python3
"""Single-writer run lock (IB-4 / v3 P0 #6).

Usage:
  python3 tools/runlock.py acquire --session "daily-2026-06-15"
  python3 tools/runlock.py status
  python3 tools/runlock.py release --session "daily-2026-06-15"

Lock is stale (takeover allowed) after 2 hours. Exit codes: 0 ok, 1 held.
"""
import json, os, sys, time, argparse

LOCK = os.path.join(os.path.dirname(__file__), "..", "state", ".runlock")
STALE_SECONDS = 2 * 3600


def read_lock():
    try:
        with open(LOCK) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def acquire(session, now=None):
    now = now or time.time()
    cur = read_lock()
    if cur and (now - cur["acquired_at"]) < STALE_SECONDS and cur["session"] != session:
        return False, cur
    data = {"session": session, "acquired_at": now,
            "takeover_from": cur["session"] if cur else None}
    with open(LOCK, "w") as f:
        json.dump(data, f)
    return True, data


def release(session):
    cur = read_lock()
    if cur and cur["session"] == session:
        os.remove(LOCK)
        return True
    return False


def main():
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["acquire", "release", "status"])
    p.add_argument("--session", default="")
    a = p.parse_args()
    if a.cmd == "status":
        cur = read_lock()
        if not cur:
            print(json.dumps({"held": False})); return 0
        age = time.time() - cur["acquired_at"]
        print(json.dumps({"held": True, "session": cur["session"],
                          "age_seconds": int(age), "stale": age >= STALE_SECONDS}))
        return 0
    if a.cmd == "acquire":
        ok, info = acquire(a.session)
        print(json.dumps({"acquired": ok, "lock": info}))
        return 0 if ok else 1
    ok = release(a.session)
    print(json.dumps({"released": ok}))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
