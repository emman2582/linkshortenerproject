#!/usr/bin/env python3
"""
Generate a bar chart of links created per month for the past 12 months.
Reads DATABASE_URL from .env in the project root (or up to 5 parent dirs).
Outputs: links_per_month.png in the current working directory.
"""

import sys
import os
from datetime import datetime, timezone
from calendar import month_abbr
from pathlib import Path


def ensure_deps():
    """Auto-install required packages if missing."""
    requirements = {
        "psycopg2": "psycopg2-binary",
        "matplotlib": "matplotlib",
        "dotenv": "python-dotenv",
    }
    missing_pip = []
    for import_name, pip_name in requirements.items():
        try:
            __import__(import_name)
        except ImportError:
            missing_pip.append(pip_name)

    if missing_pip:
        print(f"Installing missing packages: {', '.join(missing_pip)}")
        import subprocess
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--quiet"] + missing_pip
        )
        print("Packages installed.\n")


def find_env_file():
    """Walk up from cwd to find .env or .env.local."""
    search = Path.cwd()
    for _ in range(6):
        for name in (".env", ".env.local"):
            candidate = search / name
            if candidate.exists():
                return candidate
        search = search.parent
    return None


def build_month_series(now: datetime):
    """Return a list of (label, yyyy-mm) tuples for the past 12 months."""
    months = []
    for i in range(11, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        label = f"{month_abbr[month]} {year}"
        key = f"{year:04d}-{month:02d}"
        months.append((label, key))
    return months


def main():
    ensure_deps()

    from dotenv import load_dotenv
    import psycopg2
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.ticker as mticker

    # Load .env
    env_path = find_env_file()
    if env_path:
        load_dotenv(env_path)
        print(f"Loaded env: {env_path}")
    else:
        load_dotenv()

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in environment or any .env file.", file=sys.stderr)
        sys.exit(1)

    # Query DB
    print("Connecting to database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'UTC'), 'YYYY-MM') AS month_key,
            COUNT(*) AS link_count
        FROM links
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC')
        ORDER BY 1 ASC
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    print(f"Query returned {len(rows)} month(s) of data.")

    db_data = {row[0]: int(row[1]) for row in rows}

    # Build complete 12-month series (fill 0 for months with no data)
    now = datetime.now(timezone.utc)
    series = build_month_series(now)
    labels = [s[0] for s in series]
    counts = [db_data.get(s[1], 0) for s in series]

    # Plot
    fig, ax = plt.subplots(figsize=(14, 6))
    bars = ax.bar(labels, counts, color="#4F8EF7", edgecolor="#2563EB", linewidth=0.8)

    ax.set_xlabel("Month", fontsize=12, labelpad=10)
    ax.set_ylabel("Links Created", fontsize=12, labelpad=10)
    ax.set_title("Links Created Per Month — Past 12 Months", fontsize=14, fontweight="bold", pad=15)
    ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))
    ax.set_ylim(bottom=0)

    # Value labels above each bar
    for bar, val in zip(bars, counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + max(counts) * 0.01 + 0.1,
            str(val),
            ha="center",
            va="bottom",
            fontsize=10,
        )

    plt.xticks(rotation=45, ha="right", fontsize=10)
    plt.tight_layout()

    output_path = Path.cwd() / "links_per_month.png"
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\nChart saved to: {output_path}")


if __name__ == "__main__":
    main()
