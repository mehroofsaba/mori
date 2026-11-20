import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useStore } from "../store";
import { Card, Tabs } from "../components/Bits";
import { PlantIcon } from "../components/Art";
import { addDays, fmtDate, iso, today } from "../lib/dates";
import { kindFor } from "../lib/meta";

const RANGES = [
  { id: "7D", label: "7D" },
  { id: "30D", label: "30D" },
  { id: "All", label: "All" },
];

export default function Progress() {
  const { tasks } = useStore();
  const [range, setRange] = useState("7D");
  const [sel, setSel] = useState(null);

  const { buckets, total, done } = useMemo(() => {
    const done = tasks
      .filter((t) => t.completedAt)
      .map((t) => ({ t, day: iso(new Date(t.completedAt)) }));
    let n, size;
    if (range === "7D") {
      n = 7;
      size = 1;
    } else if (range === "30D") {
      n = 30;
      size = 1;
    } else {
      const oldest = done.reduce((m, d) => (d.day < m ? d.day : m), today());
      n = Math.min(
        26,
        Math.max(
          6,
          Math.ceil((new Date(today()) - new Date(oldest)) / (7 * 864e5)) + 1,
        ),
      );
      size = 7;
    }
    const buckets = Array.from({ length: n }, (_, i) => {
      const to = addDays(today(), -(n - 1 - i) * size);
      const from = addDays(to, -(size - 1));
      const items = done
        .filter((d) => d.day >= from && d.day <= to)
        .map((d) => d.t);
      return {
        from,
        to,
        items,
        label: size === 1 ? fmtDate(to) : fmtDate(from),
      };
    });
    return {
      buckets,
      total: buckets.reduce((s, b) => s + b.items.length, 0),
      done,
    };
  }, [tasks, range]);

  const max = Math.max(1, ...buckets.map((b) => b.items.length));
  const shown =
    sel !== null && buckets[sel]
      ? buckets[sel].items
      : buckets
          .flatMap((b) => b.items)
          .sort((a, b) => b.completedAt - a.completedAt);
  const phrase =
    range === "7D" ? "this week" : range === "30D" ? "this month" : "so far";

  return (
    <div className="page">
      <h1 className="display">Progress</h1>
      <Tabs
        items={RANGES}
        value={range}
        onChange={(r) => {
          setRange(r);
          setSel(null);
        }}
      />
      <div className="two-col">
        <Card title="Progress" className="prog-card">
          <p className="big-line">
            {done.length === 0 ? (
              <>
                Your first bloom is <b>waiting</b>.
              </>
            ) : (
              <>
                You’ve completed <b>{total}</b> {total === 1 ? "task" : "tasks"}{" "}
                {phrase}!
              </>
            )}
          </p>
          <div
            className="bars"
            role="list"
            aria-label="Tasks completed per period"
          >
            {buckets.map((b, i) => (
              <button
                key={b.to}
                role="listitem"
                className={"bar-col" + (sel === i ? " on" : "")}
                onClick={() => setSel(sel === i ? null : i)}
                aria-label={`${b.label}: ${b.items.length} completed`}
              >
                <motion.span
                  className="col"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.max(b.items.length ? 14 : 4, (b.items.length / max) * 100)}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 14,
                    delay: i * 0.015,
                  }}
                />
                {(buckets.length <= 8 || i % 5 === 0) && (
                  <small>{b.label}</small>
                )}
              </button>
            ))}
          </div>
          <p className="muted small-text">
            {sel !== null
              ? `Showing ${buckets[sel].label}. Tap the bar again to see everything.`
              : "Tap a bar to revisit that day."}
          </p>
        </Card>
        <Card title="Bloomed flowers">
          {shown.length === 0 && (
            <p className="empty-note">
              No blooms in this period yet. Every flower starts as a seed.
            </p>
          )}
          <ul className="bloom-grid">
            {shown.map((t) => (
              <li key={t.id}>
                <PlantIcon kind={kindFor(t.category)} stage={3} size={40} />
                <span>
                  <b>{t.title}</b>
                  <small className="muted">
                    {fmtDate(iso(new Date(t.completedAt)))}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <p className="muted small-text">
            {done.length} flowers in your garden altogether.
          </p>
        </Card>
      </div>
    </div>
  );
}
