import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Send, Sparkles } from "lucide-react";
import { useStore } from "../store";
import { useUI } from "../ui";
import Garden from "../components/Garden";
import Stats from "../components/Stats";
import TaskDetails from "../components/TaskDetails";
import Reminders from "../components/Reminders";
import { Card } from "../components/Bits";
import { SproutBuddy } from "../components/Art";
import { dailyPlan } from "../lib/planner";
import { isDone } from "../lib/meta";
import { iso } from "../lib/dates";

function AssistantCard() {
  const nav = useNavigate();
  const [text, setText] = useState("");
  const send = (e) => {
    e?.preventDefault();
    if (text.trim()) nav("/assistant?tab=dump", { state: { text } });
  };
  return (
    <Card
      title="MORI’s Assistant"
      icon={<Sparkles size={18} />}
      className="assistant-card"
    >
      <div className="buddy">
        <SproutBuddy />
        <div className="bubble">
          <b>Tell me what’s on your mind!</b>
          <small>I’ll help you organise, plan and find solutions.</small>
        </div>
      </div>
      <form className="thoughts" onSubmit={send}>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.metaKey || e.ctrlKey) && send(e)
          }
          placeholder="Type your thoughts…"
          aria-label="Type your thoughts"
        />
        <button
          className="send"
          aria-label="Sort my thoughts"
          disabled={!text.trim()}
        >
          <Send size={18} />
        </button>
      </form>
      <p className="muted small-text">
        Mori will suggest tasks for you to review. Nothing is added until you
        approve it.
      </p>
      <div className="pill-row">
        <Link className="pill" to="/assistant?tab=plan">
          Plan my day
        </Link>
        <Link className="pill" to="/assistant?tab=chat">
          I’m stuck
        </Link>
      </div>
    </Card>
  );
}

export default function Home() {
  const { tasks, prefs, selected, select, complete } = useStore();
  const { openTask, notify } = useUI();
  const plan = useMemo(() => dailyPlan(tasks, prefs), [tasks, prefs]);
  const todayIso = iso(new Date());
  const doneToday = tasks.filter(
    (t) =>
      isDone(t) && t.completedAt && iso(new Date(t.completedAt)) === todayIso,
  );
  const focus = [
    ...plan.today.slice(0, 3).map((p) => p.task),
    ...doneToday,
  ].slice(0, 4);
  const empty = tasks.length === 0;

  return (
    <div className="page home">
      <div className="greet">
        <div>
          <h1 className="display">
            Hello,{prefs.name || "little gardener"}!{""}
            <span className="heart">𖹭</span>
          </h1>
        </div>
        {!empty && (
          <button className="btn primary" onClick={() => openTask()}>
            <Plus size={16} />
            New seed
          </button>
        )}
      </div>

      <div className="home-grid">
        <div className="home-main">
          <div className="top-row">
            <Stats tasks={tasks} title="Your Garden Today" />
            {empty ? (
              <div className="cta-card">
                <p className="display">
                  Ready to create
                  <br />
                  your first task?
                </p>
                <button className="btn primary" onClick={() => openTask()}>
                  Add Your First Task 𑣲.
                </button>
              </div>
            ) : (
              <Card
                title="Today’s Focus"
                icon={<Sparkles size={18} />}
                className="focus"
              >
                {focus.length === 0 && (
                  <p className="muted">Nothing planned for today.</p>
                )}
                <ul className="focus-list">
                  {focus.map((t) => (
                    <li key={t.id}>
                      <label className={"check" + (isDone(t) ? " done" : "")}>
                        <input
                          type="checkbox"
                          checked={isDone(t)}
                          disabled={isDone(t)}
                          onChange={() => {
                            complete(t.id);
                            notify("A flower bloomed! Well done ♥");
                          }}
                        />
                        <button
                          type="button"
                          className="linklike"
                          onClick={() => select(t.id)}
                        >
                          {t.title}
                        </button>
                      </label>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
          <Garden tasks={tasks} selectedId={selected?.id} onSelect={select} />
        </div>
        <aside className="home-side">
          <AssistantCard />
          {!empty && (
            <TaskDetails
              task={selected}
              onClose={selected ? () => select(null) : null}
            />
          )}
          <Reminders />
        </aside>
      </div>
      <div className="tagline">
        <span>little steps. lovely things. one day at a time. ♥</span>
      </div>
    </div>
  );
}
