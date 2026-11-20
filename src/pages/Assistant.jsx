import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Reorder, motion, useDragControls } from "motion/react";
import {
  Coffee,
  GripVertical,
  HelpCircle,
  Lightbulb,
  MessageCircleHeart,
  Play,
  Sparkles,
  Sprout,
  StickyNote,
  Sunrise,
  X,
  Wand2,
  Send,
} from "lucide-react";
import { useStore } from "../store";
import { useUI } from "../ui";
import { Tabs, Card } from "../components/Bits";
import { parseBrainDump, suggestSteps } from "../lib/parser";
import { dailyPlan } from "../lib/planner";
import { respond } from "../lib/assistant";
import { aiReady, askBrowserAI } from "../lib/ai";
import { DEFAULT_CATEGORY, PRIORITIES, isDone, makeTask } from "../lib/meta";
import { fmtDue, fmtDuration } from "../lib/dates";
import Select from "../components/Select";
import DateField from "../components/DateField";
import CategoryInput from "../components/CategoryInput";

const TABS = [
  { id: "dump", label: "Brain Dump", icon: <Sprout size={16} /> },
  { id: "plan", label: "Daily Plan", icon: <Sunrise size={16} /> },
  { id: "chat", label: "Ask Mori", icon: <MessageCircleHeart size={16} /> },
];

export default function Assistant() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "dump";
  const [seedChat, setSeedChat] = useState("");
  return (
    <div className="page">
      <h1 className="display">Assistant</h1>
      <p className="muted">
        Unload your thoughts, find a sensible order, or talk through what’s
        blocking you.
      </p>
      <Tabs items={TABS} value={tab} onChange={(t) => setParams({ tab: t })} />
      {tab === "dump" && (
        <BrainDump
          onAsk={(t) => {
            setSeedChat(t);
            setParams({ tab: "chat" });
          }}
        />
      )}
      {tab === "plan" && <DailyPlan />}
      {tab === "chat" && <Chat seed={seedChat} />}
    </div>
  );
}

/* ---------------------------- Brain dump ---------------------------- */

function PlanItem({ item, update, remove, depLabel }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className={"plan-item" + (item.include ? "" : " off")}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 14px 30px -10px rgba(150,80,70,.4)",
      }}
    >
      <button
        type="button"
        className="grip"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
      >
        <GripVertical size={18} />
      </button>
      <input
        type="checkbox"
        checked={item.include}
        onChange={(e) => update(item.key, { include: e.target.checked })}
        aria-label="Include this task"
      />
      <div className="plan-fields">
        <input
          className="plan-title"
          value={item.title}
          onChange={(e) => update(item.key, { title: e.target.value })}
          aria-label="Task title"
        />
        <div className="plan-meta">
          <Select
            className="mini"
            ariaLabel="Priority"
            value={item.priority}
            onChange={(v) => update(item.key, { priority: v })}
            options={PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
          />
          <CategoryInput
            className="cat-in"
            value={item.category}
            onChange={(v) => update(item.key, { category: v })}
            placeholder="Category"
          />
          <DateField
            className="mini"
            ariaLabel="Deadline"
            value={item.deadline}
            onChange={(v) => update(item.key, { deadline: v })}
          />
          <span className="chip cat">{fmtDuration(item.minutes)}</span>
        </div>
        {item.missing.includes("deadline") && !item.deadline && (
          <small className="note-y">
            No deadline mentioned. Add one if there is one; I won’t guess.
          </small>
        )}
        {depLabel && <small className="note-y">Comes after: {depLabel}</small>}
        <label className="check small">
          <input
            type="checkbox"
            checked={item.withSteps}
            onChange={(e) => update(item.key, { withSteps: e.target.checked })}
          />
          Break into smaller steps ({item.steps.length})
        </label>
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={() => remove(item.key)}
        aria-label="Remove task"
      >
        <X size={16} />
      </button>
    </Reorder.Item>
  );
}

function BrainDump({ onAsk }) {
  const { add } = useStore();
  const { notify } = useUI();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [items, setItems] = useState([]);
  const loc = useLocation();

  const run = (t) => {
    const r = parseBrainDump(t);
    setRes(r);
    setItems(r.tasks);
  };
  const sort = () => run(text);
  // thoughts typed on the Home assistant card arrive here to be reviewed, never added automatically
  useEffect(() => {
    const t = loc.state?.text;
    if (t) {
      setText(t);
      run(t);
      nav(loc.pathname + loc.search, { replace: true, state: null });
    }
  }, []); // eslint-disable-line
  const update = (key, patch) =>
    setItems((l) => l.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  const remove = (key) => setItems((l) => l.filter((i) => i.key !== key));
  const plant = async () => {
    const keep = items.filter((i) => i.include && i.title.trim());
    const ids = Object.fromEntries(keep.map((i) => [i.key, makeTask({}).id]));
    add(
      keep.map((i) =>
        makeTask({
          id: ids[i.key],
          title: i.title.trim(),
          category: i.category.trim() || DEFAULT_CATEGORY,
          priority: i.priority,
          deadline: i.deadline,
          minutes: i.minutes,
          dependsOn:
            i.dependsOnKey && ids[i.dependsOnKey] ? [ids[i.dependsOnKey]] : [],
          subtasks: i.withSteps
            ? i.steps.map((s, n) => ({
                id: crypto.randomUUID(),
                title: s,
                done: false,
              }))
            : [],
        }),
      ),
    );
    notify(
      `${keep.length} ${keep.length === 1 ? "seed" : "seeds"} planted in your garden ♥`,
    );
    nav("/garden");
  };

  return (
    <div className="two-col">
      <Card title="What’s on your mind?" icon={<Wand2 size={18} />}>
        <textarea
          className="dump"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I have assignments, a project, and need to study for exams. The Java assignment is due Friday and I can’t figure out where to start with the project…"
          aria-label="Brain dump"
        />
        <div className="dump-foot">
          <small className="muted">
            Write freely. Messy is fine. Nothing is added until you approve it.
          </small>
          <button
            className="btn primary"
            disabled={!text.trim()}
            onClick={sort}
          >
            <Sparkles size={16} />
            Sort my thoughts
          </button>
        </div>
      </Card>
      <Card title="Mori’s Suggestion" icon={<Sparkles size={18} />}>
        {!res && (
          <p className="empty-note">
            Your organised plan will appear here for you to review, edit and
            rearrange.
          </p>
        )}
        {res && items.length === 0 && (
          <p className="empty-note">
            I couldn’t find a clear task. Try describing what you’d like to get
            done.
          </p>
        )}
        {items.length > 0 && (
          <>
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={setItems}
              className="plan-list"
            >
              {items.map((i) => (
                <PlanItem
                  key={i.key}
                  item={i}
                  update={update}
                  remove={remove}
                  depLabel={
                    i.dependsOnKey
                      ? items.find((x) => x.key === i.dependsOnKey)?.title
                      : null
                  }
                />
              ))}
            </Reorder.Group>
            <button
              className="btn primary wide"
              onClick={plant}
              disabled={!items.some((i) => i.include)}
            >
              Add to My Garden ♥
            </button>
          </>
        )}
        {res?.notes.length > 0 && (
          <div className="notes">
            {res.notes.map((n) => (
              <div key={n.id} className={"note " + n.type}>
                {n.type === "question" ? (
                  <HelpCircle size={16} />
                ) : n.type === "obstacle" ? (
                  <Lightbulb size={16} />
                ) : (
                  <StickyNote size={16} />
                )}
                <span>
                  <b>
                    {n.type === "question"
                      ? "A question"
                      : n.type === "obstacle"
                        ? "A sticking point"
                        : "Just a note"}
                    :
                  </b>{" "}
                  {n.text}
                  {n.type !== "info" && (
                    <button className="linklike" onClick={() => onAsk(n.text)}>
                      {" "}
                      Talk it through with Mori
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------- Daily plan ---------------------------- */

function DailyPlan() {
  const { tasks, prefs, setPrefs, update, select, postpone } = useStore();
  const { notify } = useUI();
  const nav = useNavigate();
  const plan = useMemo(() => dailyPlan(tasks, prefs), [tasks, prefs]);
  const withBreaks = [];
  let acc = 0;
  plan.today.forEach((p, i) => {
    withBreaks.push({ kind: "task", ...p });
    acc += p.minutes;
    if (acc >= 90 && i < plan.today.length - 1) {
      withBreaks.push({ kind: "break" });
      acc = 0;
    }
  });
  const start = (t) => {
    if (t.progress === 0) update(t.id, { progress: 10 });
    select(t.id);
    nav("/garden");
  };

  return (
    <div className="two-col plan-cols">
      <Card title="Today’s plan" icon={<Sunrise size={18} />}>
        <label className="slider-row">
          Time I have today: <b>{prefs.hours} h</b>
          <input
            type="range"
            min="1"
            max="10"
            value={prefs.hours}
            onChange={(e) => setPrefs({ hours: +e.target.value })}
          />
        </label>
        <label className="check small">
          <input
            type="checkbox"
            checked={prefs.gentle}
            onChange={(e) => setPrefs({ gentle: e.target.checked })}
          />
          Gentle mode: at most three things a day
        </label>
        {withBreaks.length === 0 && (
          <p className="empty-note">
            Nothing to plan. Add a seed from the Tasks page or a brain dump.
          </p>
        )}
        <ol className="day-list">
          {withBreaks.map((p, i) =>
            p.kind === "break" ? (
              <li key={"b" + i} className="break">
                <Coffee size={16} />
                Take a break and stretch ♥
              </li>
            ) : (
              <motion.li
                key={p.task.id}
                layout
                className={i === 0 ? "first" : ""}
              >
                <div>
                  <small className="when">
                    {i === 0 ? "Start here" : "Then"}
                  </small>
                  <b>{p.task.title}</b>
                  <small className="muted">
                    {p.reason} · about {fmtDuration(p.minutes)}
                  </small>
                </div>
                <div className="row-actions">
                  <button
                    className="btn small primary"
                    onClick={() => start(p.task)}
                  >
                    <Play size={14} />
                    Start
                  </button>
                  <button
                    className="btn small ghost"
                    onClick={() => {
                      postpone(p.task.id);
                      notify("Moved to tomorrow. No pressure.");
                    }}
                  >
                    Not today
                  </button>
                </div>
              </motion.li>
            ),
          )}
        </ol>
        <p className="muted small-text">
          About {fmtDuration(plan.total)} planned. Plans are flexible: change
          the hours or tap “Not today” anytime.
        </p>
      </Card>
      <Card title="What can wait" icon={<StickyNote size={18} />}>
        {plan.later.length === 0 && plan.snoozed.length === 0 && (
          <p className="empty-note">Everything fits today. Nice.</p>
        )}
        <ul className="later-list">
          {plan.later.map((p) => (
            <li key={p.task.id}>
              <b>{p.task.title}</b>
              <small className="muted">
                {p.reason}
                {p.task.deadline ? ` · ${fmtDue(p.task.deadline)}` : ""}
              </small>
            </li>
          ))}
          {plan.snoozed.map((t) => (
            <li key={t.id}>
              <b>{t.title}</b>
              <small className="muted">Resting until tomorrow</small>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------------------------- Chat ---------------------------- */

const QUICK = [
  "I’m overwhelmed by everything",
  "This task feels too big",
  "I can’t get started",
  "This topic is too difficult",
];

function Chat({ seed }) {
  const { tasks, prefs, addSubs } = useStore();
  const { notify } = useUI();
  const active = tasks.filter((t) => !isDone(t));
  const [msgs, setMsgs] = useState([
    {
      from: "mori",
      text: "Hi! Tell me what’s getting in the way, in your own words. I’ll offer ideas. You stay in charge of what you do with them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  const sent = useRef("");

  const send = async (text) => {
    const msg = text.trim();
    if (!msg) return;
    setMsgs((m) => [...m, { from: "me", text: msg }]);
    setInput("");
    const r = respond(msg, tasks);
    let extra = "";
    if (prefs.browserAI && aiReady()) {
      setBusy(true);
      try {
        extra = await askBrowserAI(
          `Give one short, kind, practical tip for someone who says: "${msg}"`,
        );
      } catch {
        /* optional */
      }
      setBusy(false);
    }
    setMsgs((m) => [
      ...m,
      { from: "mori", ...r, extra, target: r.taskId || "" },
    ]);
  };
  useEffect(() => {
    if (seed && sent.current !== seed) {
      sent.current = seed;
      send(seed);
    }
  }, [seed]); // eslint-disable-line
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, busy]);

  const setTarget = (i, v) =>
    setMsgs((m) => m.map((x, k) => (k === i ? { ...x, target: v } : x)));

  return (
    <Card
      title="Ask Mori"
      icon={<MessageCircleHeart size={18} />}
      className="chat"
    >
      <div className="msgs" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={"msg " + m.from}>
            <p>{m.text}</p>
            {m.picks && (
              <ul className="picks">
                {m.picks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {m.hint && <small className="muted">{m.hint}</small>}
            {m.steps && (
              <>
                <ul className="picks">
                  {m.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                {active.length > 0 && !m.added && (
                  <div className="add-steps">
                    <Select
                      ariaLabel="Task to add steps to"
                      placeholder="Add these steps to…"
                      value={m.target || ""}
                      onChange={(v) => setTarget(i, v)}
                      options={active.map((t) => ({
                        value: t.id,
                        label: t.title,
                      }))}
                    />
                    <button
                      className="btn small ghost"
                      disabled={!m.target}
                      onClick={() => {
                        addSubs(m.target, m.steps);
                        setMsgs((all) =>
                          all.map((x, k) =>
                            k === i ? { ...x, added: true } : x,
                          ),
                        );
                        notify("Steps added to your task");
                      }}
                    >
                      Add steps
                    </button>
                  </div>
                )}
              </>
            )}
            {m.extra && (
              <small className="ai-note">
                <Sparkles size={12} /> On-device AI idea: {m.extra}
              </small>
            )}
          </div>
        ))}
        {busy && (
          <div className="msg mori">
            <p>Thinking…</p>
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="pill-row">
        {QUICK.map((q) => (
          <button key={q} className="pill" onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What feels stuck?"
          aria-label="Message to Mori"
        />
        <button className="btn primary" type="submit">
          <Send size={16} />
          Send
        </button>
      </form>
    </Card>
  );
}
