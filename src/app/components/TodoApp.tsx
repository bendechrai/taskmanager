"use client";

import { useEffect, useReducer, useRef, useState } from "react";

type Filter = "all" | "active" | "completed";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type Action =
  | { type: "ADD"; text: string }
  | { type: "TOGGLE"; id: string }
  | { type: "DELETE"; id: string }
  | { type: "CLEAR_COMPLETED" }
  | { type: "LOAD"; todos: Todo[] };

function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "ADD":
      return [
        { id: crypto.randomUUID(), text: action.text, completed: false, createdAt: Date.now() },
        ...state,
      ];
    case "TOGGLE":
      return state.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t));
    case "DELETE":
      return state.filter((t) => t.id !== action.id);
    case "CLEAR_COMPLETED":
      return state.filter((t) => !t.completed);
    case "LOAD":
      return action.todos;
    default:
      return state;
  }
}

const STORAGE_KEY = "task-manager-todos";

export default function TodoApp() {
  const [todos, dispatch] = useReducer(reducer, []);
  const [filter, setFilter] = useState<Filter>("all");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "LOAD", todos: JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    dispatch({ type: "ADD", text });
    setInput("");
    inputRef.current?.focus();
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-zinc-950 dark:to-zinc-900 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center text-violet-700 dark:text-violet-400 mb-2 tracking-tight">
          My Tasks
        </h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          {activeCount === 0 ? "All done!" : `${activeCount} task${activeCount !== 1 ? "s" : ""} remaining`}
        </p>

        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new task…"
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-sm outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-5 py-3 text-sm font-semibold shadow-sm transition"
          >
            Add
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 text-sm select-none">
              {filter === "completed" ? "No completed tasks yet." : filter === "active" ? "No active tasks." : "No tasks yet. Add one above!"}
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {filtered.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-zinc-50 dark:hover:bg-zinc-750 transition">
                  <button
                    onClick={() => dispatch({ type: "TOGGLE", id: todo.id })}
                    aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      todo.completed
                        ? "bg-violet-600 border-violet-600"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-violet-400"
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm leading-relaxed transition ${
                      todo.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => dispatch({ type: "DELETE", id: todo.id })}
                    aria-label="Delete task"
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-zinc-400 hover:text-red-500 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-700 gap-2">
            <div className="flex gap-1">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                    filter === f
                      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {completedCount > 0 && (
              <button
                onClick={() => dispatch({ type: "CLEAR_COMPLETED" })}
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                Clear completed ({completedCount})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
