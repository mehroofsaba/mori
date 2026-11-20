import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Sunrise,
  Trash2,
} from "lucide-react";
import { useStore } from "../store";
import { useUI } from "../ui";
import {
  Bar,
  CatChip,
  DueChip,
  PriorityChip,
  TimeChip,
  Tabs,
} from "../components/Bits";
import { PlantIcon } from "../components/Art";
import { daysUntil, today } from "../lib/dates";
import { isDone, kindFor, stageOf } from "../lib/meta";
import { blockers, needsAttention, scoreTask } from "../lib/planner";
import Select from "../components/Select";

const VIEWS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "attention", label: "Needs attention" },
  { id: "done", label: "Completed" },
  { id: "all", label: "All" },
];
const PW = { high: 3, medium: 2, low: 1 };

export default function Tasks() {
  const { tasks, toggleSub, complete, reopen, postpone, remove, select } =
    useStore();
  const { openTask, notify } = useUI();
  const [view, setView] = useState("today");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("smart");
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    const t0 = today();
    let l = tasks.filter((t) => {
      if (view === "done") return isDone(t);
      if (view === "all") return true;
      if (isDone(t)) return false;
      const n = daysUntil(t.deadline);
      if (view === "attention") return needsAttention(t);
      if (view === "today")
        return (
          (n !== null && n <= 0) ||
          (t.progress > 0 && !(t.snoozedUntil > t0)) ||
          (t.priority === "high" && !(t.snoozedUntil > t0))
        );
      return n === null ? true : n > 0;
    });
    if (q.trim())
      l = l.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
    const by = {
      smart: (a, b) => scoreTask(b, tasks) - scoreTask(a, tasks),
      deadline: (a, b) =>
        (a.deadline || "9999").localeCompare(b.deadline || "9999"),
      priority: (a, b) => PW[b.priority] - PW[a.priority],
      newest: (a, b) => b.createdAt - a.createdAt,
    }[sort];
    return [...l].sort(by);
  }, [tasks, view, q, sort]);

  return (
    <div className="page">
      <div className="greet">
        <div>
          <h1 className="display">Tasks</h1>
          <p className="muted">
            Everything growing in your garden, in one calm list.
          </p>
        </div>
        <button className="btn primary" onClick={() => openTask()}>
          <Plus size={16} />
          New seed
        </button>
      </div>
      <Tabs items={VIEWS} value={view} onChange={setView} />
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
          />
        </label>
        <div className="sort">
          Sort by
          <Select
            ariaLabel="Sort by"
            value={sort}
            onChange={setSort}
            options={[
              { value: "smart", label: "Smart order" },
              { value: "deadline", label: "Deadline" },
              { value: "priority", label: "Priority" },
              { value: "newest", label: "Newest" },
            ]}
          />
        </div>
      </div>
      <ul className="task-list">
        <AnimatePresence initial={false}>
          {list.map((t) => {
            const wait = blockers(t, tasks);
            const isOpen = open === t.id;
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={"task-row" + (isDone(t) ? " done" : "")}
              >
                <div className="task-main">
                  <input
                    type="checkbox"
                    checked={isDone(t)}
                    onChange={() =>
                      isDone(t)
                        ? reopen(t.id)
                        : (complete(t.id),
                          notify("A flower bloomed! Well done ♥"))
                    }
                    aria-label={"Complete " + t.title}
                  />
                  <button
                    className="plant-btn"
                    onClick={() => select(t.id)}
                    aria-label="Show in garden"
                  >
                    <PlantIcon
                      kind={kindFor(t.category)}
                      stage={stageOf(t)}
                      size={30}
                    />
                  </button>
                  <div className="task-title">
                    <b>{t.title}</b>
                    <div className="chips">
                      <PriorityChip p={t.priority} />
                      <DueChip date={t.deadline} />
                      <CatChip c={t.category} />
                      <TimeChip m={t.minutes} />
                      {wait.length > 0 && (
                        <span className="chip wait">
                          Waits for {wait[0].title}
                        </span>
                      )}
                    </div>
                    <div className="prog-line">
                      <Bar value={t.progress} />
                      <small>{t.progress}%</small>
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="icon-btn"
                      aria-label="Edit"
                      onClick={() => openTask(t)}
                    >
                      <Pencil size={16} />
                    </button>
                    {!isDone(t) && (
                      <button
                        className="icon-btn"
                        aria-label="Postpone to tomorrow"
                        onClick={() => {
                          postpone(t.id);
                          notify("Moved to tomorrow. No pressure.");
                        }}
                      >
                        <Sunrise size={16} />
                      </button>
                    )}
                    <button
                      className="icon-btn"
                      aria-label="Delete"
                      onClick={() =>
                        window.confirm("Remove this task?") && remove(t.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                    {t.subtasks.length > 0 && (
                      <button
                        className={"icon-btn chev" + (isOpen ? " open" : "")}
                        aria-expanded={isOpen}
                        aria-label="Show steps"
                        onClick={() => setOpen(isOpen ? null : t.id)}
                      >
                        <ChevronDown size={18} />
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <ul className="subs">
                    {t.subtasks.map((s) => (
                      <li key={s.id}>
                        <label className={"check" + (s.done ? " done" : "")}>
                          <input
                            type="checkbox"
                            checked={s.done}
                            onChange={() => toggleSub(t.id, s.id)}
                          />
                          {s.title}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {list.length === 0 &&
        (tasks.length === 0 ? (
          <p className="empty-note">
            No tasks yet. Add your first one, or sort a brain dump in the
            Assistant.
          </p>
        ) : (
          <p className="empty-note">
            Nothing here right now. That’s a lovely thing.
          </p>
        ))}
    </div>
  );
}
