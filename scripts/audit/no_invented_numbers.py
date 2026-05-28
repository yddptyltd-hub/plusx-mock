#!/usr/bin/env python3
"""
no_invented_numbers.py — pre-deploy gate for unsourced numeric literals.

Exit 0 = clean. Exit 1 = violations found.

Usage:
  python3 scripts/audit/no_invented_numbers.py
  python3 scripts/audit/no_invented_numbers.py --fix   # report file:line pairs only (no writes)

NOTE: --fix is intentionally report-only. It does NOT modify source files.
A '// src: TODO' line is itself a violation — it must be replaced with a real source URL.
"""

import re
import sys
import pathlib
import argparse

# Patterns that flag a line as a "suspicious number candidate"
PATTERNS = [
    re.compile(r"\$[\d,]+(?:\.\d+)?[KMBkmb]?\b"),  # dollar amounts: $19K, $19.5B, $960K
    re.compile(r"\b\d{4,}\b"),  # 4+ digit integers: 103526, 1062, 198000
    re.compile(r"\b\d+\.\d+[KMBkmb]\b"),  # decimal shorthand: 2.41B, 14.31M
]

# A line is SOURCED if within 2 lines above it there is a // src: <real-url> comment.
# '// src: TODO' is NOT a valid source — it is itself a violation.
SRC_COMMENT = re.compile(r"//\s*src:\s*(?!TODO\b)\S")

# A line is SOURCED if the suspicious value lives inside a function-call argument
# (i.e., not a string literal). Heuristic: the value appears after ( or , without quotes.
DYNAMIC_CONTEXT = re.compile(
    r"(?:useSWR|fetch|useState|useRef|useMemo|fallback)\s*[<(]"
)

# Allowlist: patterns that are always safe (not user-visible financial stats)
ALLOWLIST_PATTERNS = [
    re.compile(r"//.*\$[\d]"),  # inside a comment already
    re.compile(r"refreshInterval"),  # timing constants
    re.compile(r"dedupingInterval"),
    re.compile(r"errorRetryInterval"),
    re.compile(r"errorRetryCount"),
    re.compile(r"TTL_MS"),
    re.compile(r"port\s*[:=]\s*\d"),  # port numbers
    re.compile(r"0x[0-9a-fA-F]{4,}"),  # hex addresses / selectors
    re.compile(r"width|height|size|px|rem|ms\b|fps\b|crf\b"),  # dimensions/timing
    re.compile(r"z-index|grid-cols|gap-\d|p-\d|py-\d|px-\d|sm:|lg:|xl:"),  # Tailwind
    re.compile(r"take\s*=\s*\d"),  # API pagination params
    re.compile(r"wordIndex"),
    re.compile(r"1_000_000|1_000|1e\d"),  # pure math constants
    # Time constants: seconds per hour/day/week, ms timeouts
    re.compile(r"\b(?:3600|7200|86400|604800|2592000|1800|1440)\b"),
    re.compile(r"setTimeout|setInterval|expirationTtl|AbortSignal"),
    # Unix epoch / timestamp math — not financial values
    re.compile(r"Date\.now\(\)|\.getTime\(\)|Math\.floor|Math\.ceil"),
    # Zero-dollar placeholders — empty state strings, not claims
    re.compile(r'"\$0(?:\.00)?"|`\$0(?:\.00)?`|\$0\.00'),
    # SVG attributes — viewBox, stroke, fill, path d=
    re.compile(r"viewBox|xmlns|stroke|fill=|\" d="),
    # Regex replace patterns containing $1 capture group
    re.compile(r"replace\s*\("),
    # JSDoc / block comment lines starting with *
    re.compile(r"^\s*\*"),
    # Math divide/multiply by 1000 — ms↔s conversion, not a stat
    re.compile(r"/\s*1000\b|\* 1000\b"),
    # Algorithm/PRNG constants (Math.imul, bit ops)
    re.compile(r"Math\.imul|>>>\s*0"),
    # Precision threshold / minMove values (0.000...)
    re.compile(r"0\.0{3,}"),
    # Cache / KV put operations
    re.compile(r"\.put\(|SNAPSHOTS\.put"),
    # Logging / score raw computation (not displayed)
    re.compile(r"rawVolScore|mean24h|std24h|Math\.log10|Math\.sqrt|rankScore"),
    # UI state timeouts (copy feedback, spinner)
    re.compile(r"setCopied|setStatus|setMissing|animate-spin"),
    # Hex color codes (e.g. #475569)
    re.compile(r"#[0-9a-fA-F]{6}\b"),
    # Mastodon engagement counts
    re.compile(r"favourites_count|reblogs_count|replies_count"),
    # Tailwind arbitrary values
    re.compile(r"\[#[0-9a-fA-F]{3,6}\]|\[\d+(?:px|rem)\]"),
    # MIN_LIQUIDITY filter threshold — risk flag, not a claimed stat
    re.compile(r"MIN_LIQUIDITY|WINDOW_BLOCKS|windowBlocks"),
    # Year strings in comments / file headers
    re.compile(r"20\d\d-\d{2}-\d{2}|updated 20\d\d|verified 20\d\d"),
    # Formatting threshold in format helpers (not a displayed financial figure)
    re.compile(r"if\s*\(value\s*[<>]=?\s*\d"),
    # DAI oracle peg in tooltip/comment — fixed canonical value, not a claim
    re.compile(r"DAI treated as|ecosystem oracle"),
    # Portfolio placeholder — connected-wallet empty state UI, not real stats
    re.compile(r"Portfolio Value|Claimable Yield|PnL vs HODL"),
    # MethodologyPanel prose — values on this page are the documented sources themselves
    re.compile(r"oracle peg of|March 2026|counted log audit"),
]

GLOB_PATTERNS = ["src/**/*.tsx", "src/**/*.ts", "worker/src/**/*.ts"]


def is_allowlisted(line: str) -> bool:
    return any(p.search(line) for p in ALLOWLIST_PATTERNS)


def has_src_comment_nearby(lines: list[str], idx: int) -> bool:
    start = max(0, idx - 2)
    return any(SRC_COMMENT.search(lines[j]) for j in range(start, idx))


def is_dynamic_context(line: str) -> bool:
    return bool(DYNAMIC_CONTEXT.search(line))


def scan_file(path: pathlib.Path) -> list[tuple[int, str, str]]:
    """Return list of (lineno_1indexed, value_matched, line_text) for violations."""
    violations = []
    lines = path.read_text(encoding="utf-8").splitlines()
    for idx, line in enumerate(lines):
        if is_allowlisted(line):
            continue
        if is_dynamic_context(line):
            continue
        for pat in PATTERNS:
            for m in pat.finditer(line):
                if has_src_comment_nearby(lines, idx):
                    break
                violations.append((idx + 1, m.group(), line.strip()))
                break  # one violation per line
    return violations


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix", action="store_true")
    args = parser.parse_args()

    root = pathlib.Path(__file__).resolve().parent.parent.parent
    all_violations: list[tuple[pathlib.Path, int, str, str]] = []

    for glob in GLOB_PATTERNS:
        for p in sorted(root.glob(glob)):
            for lineno, val, ctx in scan_file(p):
                rel = p.relative_to(root)
                all_violations.append((rel, lineno, val, ctx))

    if all_violations:
        print(f"UNSOURCED NUMBERS — {len(all_violations)} violation(s):\n")
        for rel, lineno, val, ctx in all_violations:
            print(f"  {rel}:{lineno} | {val} | {ctx}")

        if args.fix:
            print(
                f"\n--fix (report-only): {len(all_violations)} line(s) need a real source URL."
            )
            print(
                "Add '// src: <url>' above each flagged line. Do NOT use '// src: TODO'."
            )
        sys.exit(1)
    else:
        print("OK — no unsourced numbers found.")
        sys.exit(0)


if __name__ == "__main__":
    main()
