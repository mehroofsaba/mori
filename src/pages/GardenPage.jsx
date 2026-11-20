import { useState } from "react";
import { useStore } from "../store";
import Garden from "../components/Garden";
import TaskDetails from "../components/TaskDetails";
import { PlantIcon } from "../components/Art";
import { Card } from "../components/Bits";
import Stats from "../components/Stats";
import { catLabel } from "../lib/meta";

const STAGES = [
  ["daisy", 0, "Seed"],
  ["daisy", 1, "Sprout"],
  ["daisy", 2, "Growing"],
  ["daisy", 3, "Bloomed"],
];

export default function GardenPage() {
  const { tasks, selected, select } = useStore();
  const [cat, setCat] = useState("all");
  const cats = [...new Set(tasks.map((t) => catLabel(t.category)))].sort();
  const shown =
    cat === "all" ? tasks : tasks.filter((t) => catLabel(t.category) === cat);
  return (
    <div className="page">
      <h1 className="display">My Garden‎𖹭</h1>
      <Stats tasks={tasks} title="Your Garden Today" />
      <div className="pill-row" role="group" aria-label="Filter by category">
        <button
          className={"pill" + (cat === "all" ? " on" : "")}
          onClick={() => setCat("all")}
        >
          All
        </button>
        {cats.map((c) => (
          <button
            key={c}
            className={"pill" + (cat === c ? " on" : "")}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="home-grid">
        <div className="home-main">
          <Garden tasks={shown} selectedId={selected?.id} onSelect={select} />
        </div>
        <aside className="home-side">
          {tasks.length > 0 && (
            <TaskDetails
              task={selected}
              onClose={selected ? () => select(null) : null}
            />
          )}
          <Card title="Your Garden Grows…" className="grows">
            <div className="grow-row">
              {STAGES.map(([k, s, l], i) => (
                <div key={l} className="grow-step">
                  <PlantIcon kind={k} stage={s} size={42} />
                  <small>{l}</small>
                  {i < 3 && <span className="arrow">→</span>}
                </div>
              ))}
            </div>
            <p className="muted small-text">
              Plants that need a little attention show a soft yellow “!”.
              Nothing ever wilts.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
