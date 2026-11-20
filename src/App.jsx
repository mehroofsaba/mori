import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  BarChart3,
  Flower2,
  ListChecks,
  LogOut,
  MessageCircleHeart,
  Settings as Cog,
  Home as HomeIcon,
} from "lucide-react";
import { useAuth } from "./auth";
import { useStore } from "./store";
import { CatMascot, Logo, Butterfly } from "./components/Art";
import Home from "./pages/Home";
import GardenPage from "./pages/GardenPage";
import Tasks from "./pages/Tasks";
import Assistant from "./pages/Assistant";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import { fmtDue, today } from "./lib/dates";
import { reminderGroups, reminderSummary } from "./lib/reminders";

const NAV = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/garden", label: "My Garden", icon: Flower2 },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/assistant", label: "Assistant", icon: MessageCircleHeart },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Cog },
];

function BellMenu() {
  const { tasks, select, prefs } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const g = reminderGroups(tasks, prefs);
  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const rows = [
    ["Waiting for you", g.overdue],
    ["Due today", g.dueToday],
    ["Coming up", g.soon],
  ].filter(([, l]) => l.length);
  return (
    <div className="bell-wrap" ref={ref}>
      <button
        className="icon-btn bell"
        aria-label={`Reminders (${g.count})`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Bell size={20} />
        {g.count > 0 && <i>{g.count}</i>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="popover"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <b>Reminders</b>
            {rows.length === 0 && (
              <p className="muted">Nothing is due. All calm in the garden.</p>
            )}
            {rows.map(([label, list]) => (
              <div key={label} className="rem-group">
                <small className="when">{label}</small>
                {list.map((t) => (
                  <button
                    key={t.id}
                    className="pop-item"
                    onClick={() => {
                      select(t.id);
                      nav("/garden");
                      setOpen(false);
                    }}
                  >
                    {t.title}
                    <small>{fmtDue(t.deadline)}</small>
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AvatarMenu() {
  const { user, signOut } = useAuth();
  const { prefs } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="bell-wrap" ref={ref}>
      <button
        className="avatar"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {(prefs.name || user.email || "M")[0].toUpperCase()}
      </button>
      {open && (
        <div className="popover">
          <b>{prefs.name || "Gardener"}</b>
          <small className="muted">{user.email}</small>
          <button
            className="pop-item"
            onClick={() => {
              nav("/settings");
              setOpen(false);
            }}
          >
            Settings
          </button>
          <button className="pop-item" onClick={signOut}>
            Log out <LogOut size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { prefs, setPrefs, tasks, error, reload, dismissError } = useStore();
  const loc = useLocation();

  // browser notification built from the user's real deadlines (only while Mori is open)
  useEffect(() => {
    if (!prefs.reminders || !("Notification" in window)) return;
    const check = () => {
      const now = new Date();
      const hm =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");
      if (
        hm < prefs.reminderTime ||
        prefs.lastReminder === today() ||
        Notification.permission !== "granted"
      )
        return;
      const g = reminderGroups(tasks, prefs);
      if (g.count) new Notification("Mori", { body: reminderSummary(g) });
      setPrefs({ lastReminder: today() });
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [prefs, tasks, setPrefs]);

  return (
    <div className="stage">
      <svg className="bg-flutter" viewBox="0 0 1200 800" aria-hidden="true">
        <Butterfly x={140} y={120} path={90} dur={16} />
        <Butterfly
          x={1000}
          y={560}
          color="#D8C8F3"
          path={-80}
          dur={19}
          delay={3}
          scale={0.9}
        />
      </svg>
      <div className="window">
        <aside className="sidebar">
          <div className="brand">
            <div className="wordmark">
              <span className="display">Mori</span>
              <Logo size={26} />
            </div>
            <small>The Thought Garden</small>
          </div>
          <nav aria-label="Main">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  "nav-item" + (isActive ? " active" : "")
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mascot">
            <span className="cloud">You’ve got this ♥</span>
            <CatMascot size={150} />
          </div>
        </aside>
        <main className="content">
          <div className="topbar">
            <span className="tag display">
              Plant your thoughts. Grow your days. ♥
            </span>
            <BellMenu />
            <AvatarMenu />
          </div>
          {error && (
            <div className="sync-banner" role="alert">
              {error}
              <button
                className="btn small ghost"
                onClick={() => {
                  dismissError();
                  reload();
                }}
              >
                Reload my garden
              </button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <Routes location={loc}>
                <Route path="/" element={<Home />} />
                <Route path="/garden" element={<GardenPage />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
