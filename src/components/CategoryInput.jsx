import { useState } from "react";
import { useStore } from "../store";
import { DEFAULT_CATEGORY, SUGGESTED_CATEGORIES, catLabel } from "../lib/meta";

/** Free-text category with a themed suggestion list (replaces <input list> + <datalist>). */
export default function CategoryInput({
  value,
  onChange,
  placeholder = "Category",
  className = "",
}) {
  const { tasks } = useStore();
  const [open, setOpen] = useState(false);
  const all = [
    ...new Set([
      ...SUGGESTED_CATEGORIES,
      ...tasks.map((t) => catLabel(t.category)),
    ]),
  ].filter((c) => c !== DEFAULT_CATEGORY);
  const q = value.trim().toLowerCase();
  const list = all
    .filter((c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q)
    .slice(0, 8);
  return (
    <div className={"sel combo " + className}>
      <input
        value={value}
        maxLength={60}
        placeholder={placeholder}
        autoComplete="off"
        aria-label="Category"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && list.length > 0 && (
        <ul className="sel-list" role="listbox">
          {list.map((c) => (
            <li
              key={c}
              role="option"
              aria-selected="false"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
            >
              <span>{c}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
