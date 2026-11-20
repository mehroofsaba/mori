import { useRef, useState } from "react";
import { Cpu, Download, LogOut, Upload } from "lucide-react";
import { useAuth } from "../auth";
import { useStore } from "../store";
import { useUI } from "../ui";
import { Card } from "../components/Bits";
import Select from "../components/Select";
import TimeField from "../components/TimeField";
import { loadBrowserAI, aiReady } from "../lib/ai";

const THEMES = [
  {
    id: "meadow",
    label: "Meadow",
    g: "linear-gradient(#F7C9DD,#FFEBD8 55%,#8DC77F 56%)",
  },
  {
    id: "dusk",
    label: "Dusk",
    g: "linear-gradient(#C9B5F0,#FFD2B0 55%,#8FBF8B 56%)",
  },
  {
    id: "mint",
    label: "Mint",
    g: "linear-gradient(#BFE8E0,#FFF4D6 55%,#79C497 56%)",
  },
];
const VIBES = [
  { id: "soft", label: "Soft" },
  { id: "cozy", label: "Cozy" },
  { id: "dreamy", label: "Dreamy" },
];
const LEADS = [
  [0, "Only on the day"],
  [1, "1 day before"],
  [2, "2 days before"],
  [3, "3 days before"],
  [7, "A week before"],
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { prefs, setPrefs, tasks, importTasks, clearAll } = useStore();
  const { notify } = useUI();
  const file = useRef(null);
  const [ai, setAi] = useState({
    state: aiReady() ? "ready" : "idle",
    pct: 0,
    err: "",
  });
  const perm =
    "Notification" in window ? Notification.permission : "unsupported";

  const toggleReminders = async (on) => {
    if (on && "Notification" in window && Notification.permission === "default")
      await Notification.requestPermission();
    setPrefs({ reminders: on });
  };
  const enableAI = async () => {
    setAi({ state: "loading", pct: 0, err: "" });
    try {
      await loadBrowserAI(
        (p) =>
          p?.progress != null &&
          setAi((a) => ({ ...a, pct: Math.round(p.progress) })),
      );
      setPrefs({ browserAI: true });
      setAi({ state: "ready", pct: 100, err: "" });
    } catch {
      setAi({
        state: "error",
        pct: 0,
        err: "Could not load the model. Check your connection and try again.",
      });
    }
  };
  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ app: "mori", version: 2, tasks }, null, 2)],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mori-garden.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (
        !Array.isArray(d.tasks) ||
        d.tasks.some((t) => typeof t.title !== "string")
      )
        throw new Error();
      await importTasks(d.tasks);
      notify(`${d.tasks.length} tasks added from your backup`);
    } catch {
      notify("That file doesn’t look like a Mori backup");
    }
    e.target.value = "";
  };

  return (
    <div className="page">
      <h1 className="display">Settings</h1>
      <p className="muted">
        Make the garden yours. Your garden is private and saved to your account.
      </p>
      <div className="two-col">
        <Card title="Account">
          <p>
            <b>{prefs.name || "Gardener"}</b>
          </p>
          <p className="muted">{user.email}</p>
          <label>
            What should Mori call you?
            <input
              value={prefs.name}
              onChange={(e) => setPrefs({ name: e.target.value })}
              placeholder="little gardener"
              maxLength={24}
            />
          </label>
          <button className="btn ghost" onClick={signOut}>
            <LogOut size={16} />
            Log out
          </button>
        </Card>
        <Card title="Personalisation">
          <p className="label-like">Choose your garden theme</p>
          <div className="themes" role="radiogroup" aria-label="Garden theme">
            {THEMES.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={prefs.gardenTheme === t.id}
                className={"theme" + (prefs.gardenTheme === t.id ? " on" : "")}
                onClick={() => setPrefs({ gardenTheme: t.id })}
              >
                <span style={{ background: t.g }} />
                <small>{t.label}</small>
              </button>
            ))}
          </div>
          <p className="label-like">Pick your vibe</p>
          <div className="pill-row" role="radiogroup" aria-label="Vibe">
            {VIBES.map((v) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={prefs.vibe === v.id}
                className={"pill" + (prefs.vibe === v.id ? " on" : "")}
                onClick={() => setPrefs({ vibe: v.id })}
              >
                {v.label}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Reminders">
          <p className="muted small-text">
            Reminders are based on the deadlines you set. Tasks without a
            deadline never nag you.
          </p>
          <label className="check">
            <input
              type="checkbox"
              checked={prefs.reminders}
              onChange={(e) => toggleReminders(e.target.checked)}
            />
            Browser notifications while Mori is open
          </label>
          {prefs.reminders && perm === "denied" && (
            <p className="note-y">
              Notifications are blocked in your browser settings for this site.
            </p>
          )}
          {prefs.reminders && perm === "unsupported" && (
            <p className="note-y">
              This browser doesn’t support notifications. The bell and reminder
              card still work.
            </p>
          )}
          {prefs.reminders && (
            <label>
              Remind me at
              <TimeField
                value={prefs.reminderTime}
                onChange={(v) => setPrefs({ reminderTime: v })}
              />
            </label>
          )}
          <label>
            Include tasks coming up
            <Select
              ariaLabel="Include tasks coming up"
              value={prefs.remindLead}
              onChange={(v) => setPrefs({ remindLead: +v })}
              options={LEADS.map(([v, l]) => ({ value: v, label: l }))}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={prefs.remindOverdue}
              onChange={(e) => setPrefs({ remindOverdue: e.target.checked })}
            />
            Include tasks past their deadline
          </label>
        </Card>
        <Card title="Planning">
          <label className="slider-row">
            Hours I usually have per day: <b>{prefs.hours} h</b>
            <input
              type="range"
              min="1"
              max="10"
              value={prefs.hours}
              onChange={(e) => setPrefs({ hours: +e.target.value })}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={prefs.gentle}
              onChange={(e) => setPrefs({ gentle: e.target.checked })}
            />
            Gentle mode: plan at most three tasks a day
          </label>
        </Card>
        <Card title="Browser AI (optional)" icon={<Cpu size={18} />}>
          <p className="muted small-text">
            Mori works fully without this. If you switch it on, a small language
            model (about 60 MB) is downloaded once and runs entirely in your
            browser. Your text is not sent anywhere. It adds a short extra idea
            in Ask Mori.
          </p>
          {ai.state === "ready" && prefs.browserAI ? (
            <button
              className="btn ghost"
              onClick={() => setPrefs({ browserAI: false })}
            >
              Turn off browser AI
            </button>
          ) : (
            <button
              className="btn primary"
              onClick={enableAI}
              disabled={ai.state === "loading"}
            >
              {ai.state === "loading"
                ? `Downloading… ${ai.pct}%`
                : "Download and turn on"}
            </button>
          )}
          {ai.err && <p className="note-y">{ai.err}</p>}
        </Card>
        <Card title="Your data">
          <p className="muted small-text">
            Your tasks and progress are stored in your private account. Only you
            can read them.
          </p>
          <div className="actions">
            <button
              className="btn ghost"
              onClick={exportData}
              disabled={!tasks.length}
            >
              <Download size={16} />
              Export
            </button>
            <button className="btn ghost" onClick={() => file.current?.click()}>
              <Upload size={16} />
              Import
            </button>
            <input
              ref={file}
              type="file"
              accept="application/json"
              hidden
              onChange={importData}
            />
            <button
              className="btn ghost danger"
              disabled={!tasks.length}
              onClick={() =>
                window.confirm(
                  "Delete ALL your tasks? This cannot be undone.",
                ) && (clearAll(), notify("Garden cleared"))
              }
            >
              Delete all my tasks
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
