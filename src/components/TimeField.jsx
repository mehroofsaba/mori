import Select from "./Select";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, "0"),
);

/** Themed replacement for <input type="time">. value / onChange use 'HH:MM'. */
export default function TimeField({ value = "09:00", onChange }) {
  const [h, m] = value.split(":");
  const mins = MINS.includes(m) ? MINS : [...MINS, m].sort();
  return (
    <div className="time-field">
      <Select
        ariaLabel="Hour"
        value={h}
        onChange={(v) => onChange(`${v}:${m}`)}
        options={HOURS}
      />
      <span>:</span>
      <Select
        ariaLabel="Minute"
        value={m}
        onChange={(v) => onChange(`${h}:${v}`)}
        options={mins}
      />
    </div>
  );
}
