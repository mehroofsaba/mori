import { useState } from "react";
import { motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useStore } from "../store";
import { DEFAULT_CATEGORY, PRIORITIES, makeTask, isDone } from "../lib/meta";
import Select from "./Select";
import DateField from "./DateField";
import CategoryInput from "./CategoryInput";

export default function TaskModal({ task, onClose, onSaved }) {
  const { tasks, add, update } = useStore();
  const [f, setF] = useState(() => ({
    title: task?.title || "",
    description: task?.description || "",
    category: task && task.category !== DEFAULT_CATEGORY ? task.category : "",
    priority: task?.priority || "medium",
    deadline: task?.deadline || "",
    minutes: task?.minutes || 45,
    subtasks: task?.subtasks || [],
    dependsOn: task?.dependsOn || [],
  }));
  const [sub, setSub] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const others = tasks.filter((t) => t.id !== task?.id && !isDone(t));

  const addSub = () => {
    if (!sub.trim()) return;
    setF({
      ...f,
      subtasks: [
        ...f.subtasks,
        { id: crypto.randomUUID(), title: sub.trim(), done: false },
      ],
    });
    setSub("");
  };
  const save = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const data = {
      ...f,
      title: f.title.trim(),
      category: f.category.trim() || DEFAULT_CATEGORY,
      minutes: Math.max(5, +f.minutes || 45),
    };
    if (task) {
      const patch = { ...data };
      if (
        data.subtasks.length &&
        data.subtasks.length !== task.subtasks.length
      ) {
        patch.progress = Math.round(
          (data.subtasks.filter((s) => s.done).length / data.subtasks.length) *
            100,
        );
      }
      update(task.id, patch);
    } else add([makeTask(data)]);
    onSaved?.(task ? "Task updated" : "A new seed is planted");
    onClose();
  };

  return (
    <motion.div
      className="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.form
        className="modal"
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-label={task ? "Edit task" : "New task"}
        initial={{ y: 30, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        <header className="card-head">
          <h2 className="display">{task ? "Edit task" : "Plant a new seed"}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>
        <label>
          Title
          <input
            autoFocus
            value={f.title}
            onChange={set("title")}
            placeholder="What would you like to do?"
            required
          />
        </label>
        <label>
          Notes
          <textarea
            rows={2}
            value={f.description}
            onChange={set("description")}
            placeholder="Anything that helps future you"
          />
        </label>
        <div className="row3">
          <label>
            Category
            <CategoryInput
              value={f.category}
              onChange={(v) => setF({ ...f, category: v })}
              placeholder="Your own, e.g. Thesis"
            />
          </label>
          <label>
            Priority
            <Select
              ariaLabel="Priority"
              value={f.priority}
              onChange={(v) => setF({ ...f, priority: v })}
              options={PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
            />
          </label>
          <label>
            Estimate (min)
            <input
              type="number"
              min="5"
              step="5"
              value={f.minutes}
              onChange={set("minutes")}
            />
          </label>
        </div>
        <label>
          Deadline (optional)
          <DateField
            ariaLabel="Deadline"
            value={f.deadline}
            onChange={(v) => setF({ ...f, deadline: v })}
          />
        </label>
        <fieldset>
          <legend>Smaller steps</legend>
          {f.subtasks.map((s) => (
            <div key={s.id} className="sub-edit">
              <input
                type="checkbox"
                checked={s.done}
                onChange={() =>
                  setF({
                    ...f,
                    subtasks: f.subtasks.map((x) =>
                      x.id === s.id ? { ...x, done: !x.done } : x,
                    ),
                  })
                }
                aria-label={"Done: " + s.title}
              />
              <span>{s.title}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label={"Remove " + s.title}
                onClick={() =>
                  setF({
                    ...f,
                    subtasks: f.subtasks.filter((x) => x.id !== s.id),
                  })
                }
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="sub-add">
            <input
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSub())
              }
              placeholder="Add a step…"
            />
            <button type="button" className="btn small ghost" onClick={addSub}>
              <Plus size={14} />
              Add
            </button>
          </div>
        </fieldset>
        {others.length > 0 && (
          <fieldset>
            <legend>Needs to happen first</legend>
            <div className="deps">
              {others.map((o) => (
                <label key={o.id} className="check">
                  <input
                    type="checkbox"
                    checked={f.dependsOn.includes(o.id)}
                    onChange={() =>
                      setF({
                        ...f,
                        dependsOn: f.dependsOn.includes(o.id)
                          ? f.dependsOn.filter((d) => d !== o.id)
                          : [...f.dependsOn, o.id],
                      })
                    }
                  />
                  {o.title}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <footer className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            {task ? "Save changes" : "Plant it"}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
}
