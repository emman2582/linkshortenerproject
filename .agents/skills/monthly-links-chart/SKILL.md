---
name: monthly-links-chart
description: Generates a bar chart PNG showing how many links were created each month for the past 12 months. Use this skill whenever the user asks to visualize link creation data, generate a links chart, plot link statistics, see a graph of links over time, analyze monthly link trends, or wants to know how many links were created each month. Always use this skill for any request involving charts, graphs, or visualizations of links data, even if the user doesn't say "chart" explicitly.
---

# Monthly Links Chart

Generates `links_per_month.png` — a bar chart showing links created per month over the past 12 months, queried from the project's PostgreSQL database.

## Prerequisites

- Python 3 installed and on PATH
- `DATABASE_URL` set in the project's `.env` file

The script auto-installs `psycopg2-binary`, `matplotlib`, and `python-dotenv` if they're not already available.

## How to run

From the project root:

```bash
python .agents/skills/monthly-links-chart/scripts/generate_chart.py
```

## What the script does

1. Searches up the directory tree to find the `.env` file and reads `DATABASE_URL`.
2. Connects to the PostgreSQL database and runs:
   ```sql
   SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM'), COUNT(*)
   FROM links
   WHERE created_at >= NOW() - INTERVAL '12 months'
   GROUP BY 1 ORDER BY 1
   ```
3. Fills in `0` for any months with no links (so all 12 months always appear).
4. Renders a bar chart (14×6 inches, 150 dpi) and saves it as `links_per_month.png` in the working directory.

## Expected output

`links_per_month.png` in the project root:
- **X-axis**: the 12 calendar months leading up to today (e.g. `Aug 2025 … Aug 2026`)
- **Y-axis**: integer count of links created that month
- Each bar is labeled with its exact count

## Reporting back to the user

After the script exits successfully, tell the user:
- The full path to `links_per_month.png`
- A brief summary (e.g. which month had the most links, total links in the period)
