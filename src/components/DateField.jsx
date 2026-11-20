import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { iso, today } from "../lib/dates";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Themed replacement for <input type="date">. value / onChange use 'YYYY-MM-DD' (or '' for none). */
export default function DateField({
  value,
  onChange,
  ariaLabel = "Date",
  placeholder = "No deadline",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const start = value ? new Date(value + "T00:00:00") : new Date();
  const [view, setView] = useState({
    y: start.getFullYear(),
    m: start.getMonth(),
  });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const d = value ? new Date(value + "T00:00:00") : new Date();
      setView({ y: d.getFullYear(), m: d.getMonth() });
    }
    setOpen(!open);
  };
  const shift = (n) => {
    const d = new Date(view.y, view.m + n, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };
  const lead = new Date(view.y, view.m, 1).getDay();
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [
    ...Array(lead).fill(null),
    ...Array.from({ length: count }, (_, i) =>
      iso(new Date(view.y, view.m, i + 1)),
    ),
  ];
  const pick = (d) => {
    onChange(d);
    setOpen(false);
  };
  const label = value
    ? new Date(value + "T00:00:00").toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : placeholder;
  const t0 = today();

  return (
    <div className={"sel date-field " + className} ref={ref}>
      <button
        type="button"
        className="sel-btn"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className={value ? "" : "ph"}>{label}</span>
        <CalendarDays size={16} />
      </button>
      {open && (
        <div className="date-pop" role="dialog" aria-label="Choose a date">
          <div className="date-head">
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous month"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {new Date(view.y, view.m, 1).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next month"
              onClick={() => shift(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="date-grid">
            {DOW.map((d) => (
              <span key={d} className="dow">
                {d}
              </span>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={d}
                  type="button"
                  className={
                    (d === value ? "on " : "") + (d === t0 ? "today" : "")
                  }
                  onClick={() => pick(d)}
                >
                  {+d.slice(8)}
                </button>
              ) : (
                <span key={"e" + i} />
              ),
            )}
          </div>
          <div className="date-foot">
            <button type="button" onClick={() => pick("")}>
              Clear
            </button>
            <button type="button" onClick={() => pick(t0)}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
