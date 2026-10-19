import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usePagedTasks from "../hooks/usePagedTasks";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";

const FILTER_OPTIONS = [
  { value: "UNASSIGNED", label: "Свободные задачи", unassigned: true, status: undefined },
  { value: "CREATED", label: "Свободные — Созданы", unassigned: true, status: "CREATED" },
  { value: "PUBLISHED", label: "Свободные — Опубликованы", unassigned: true, status: "PUBLISHED" },
  { value: "ALL_TASKS", label: "Все задачи (включая назначенные)", unassigned: undefined, status: undefined },
];

export default function TaskListPage() {
  const [page, setPage] = useState(0); // backend is 0-indexed
  const [filterMode, setFilterMode] = useState("UNASSIGNED");

  const { user } = useAuth();
  const navigate = useNavigate();

  const currentOption = FILTER_OPTIONS.find((o) => o.value === filterMode) || FILTER_OPTIONS[0];
  const { tasks, totalPages, loading, error } = usePagedTasks({
    page,
    status: currentOption.status,
    unassigned: currentOption.unassigned,
  });

  return (
    <div className="fade-in">
      <div className="section-title">
        {filterMode === "ALL_TASKS" ? "Все задачи организации" : "Свободные задачи"}
      </div>
      
      {user?.canCreateTask && (
        <div className="filter-wrapper mb-4">
          <svg className="filter-icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <select
            className="form-select filter-select"
            value={filterMode}
            onChange={(e) => {
              setFilterMode(e.target.value);
              setPage(0);
            }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && (
        <div className="task-list">
          <div className="skeleton skeleton--card"></div>
          <div className="skeleton skeleton--card"></div>
          <div className="skeleton skeleton--card"></div>
        </div>
      )}

      {error && <div className="form-error mb-4">{error}</div>}

      {!loading && tasks.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div className="empty-state__title">
            {filterMode === "ALL_TASKS" ? "Нет задач" : "Нет свободных задач"}
          </div>
          <div className="empty-state__text">
            {filterMode === "ALL_TASKS"
              ? "В организации пока нет задач."
              : "Все задачи распределены по исполнителям или ещё не созданы."}
          </div>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {user?.canCreateTask && (
        <button aria-label="Создать задачу" className="fab" onClick={() => navigate("/tasks/new")}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      )}
    </div>
  );
}
