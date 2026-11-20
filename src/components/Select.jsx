import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/** Themed replacement for <select>. options: [{ value, label }] or plain strings. */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  ariaLabel,
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const listId = useId();
  const opts = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: String(o) },
  );
  const same = (o) => String(o.value) === String(value);
  const current = opts.find(same);

  useEffect(() => {
    if (!open) return;
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, opts.findIndex(same)));
    setOpen(true);
  };
  const pick = (o) => {
    onChange(o.value);
    setOpen(false);
    ref.current?.querySelector("button")?.focus();
  };
  const onKey = (e) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "Tab") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(opts.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (opts[active]) pick(opts[active]);
    }
  };

  return (
    <div className={"sel " + className} ref={ref}>
      <button
        type="button"
        className="sel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
      >
        <span className={current ? "" : "ph"}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <ul className="sel-list" role="listbox" id={listId}>
          {opts.map((o, i) => (
            <li
              key={String(o.value)}
              role="option"
              aria-selected={same(o)}
              className={
                (i === active ? "act " : "") + (same(o) ? "sel-on" : "")
              }
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(o)}
            >
              <span>{o.label}</span>
              {same(o) && <Check size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
