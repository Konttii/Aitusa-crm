import { useState } from "react";
import usePagedTasks from "../hooks/usePagedTasks";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";

const STATUS_OPTIONS = [
  { value: "", label: "Все" },
  { value: "ASSIGNED", label: "Назначена" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "COMPLETED", label: "Завершена" }
];

export default function MyTasksPage() {
  const [page, setPage] = useState(0); 
  const [statusFilter, setStatusFilter] = useState("");

  const { user } = useAuth();

  const { tasks, totalPages, loading, error } = usePagedTasks({
    page,
    status: statusFilter || undefined,
    assignedTo: user?.id,
    enabled: Boolean(user?.id),
  });

  return (
    <div className="fade-in">
      <div className="section-title">Мои задачи</div>
      
      <div className="filter-wrapper mb-4">
        <svg className="filter-icon" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <select
          className="form-select filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value === "" ? "Все задачи" : opt.label}
            </option>
          ))}
        </select>
      </div>

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
          <div className="empty-state__title">Нет задач</div>
          <div className="empty-state__text">
            {statusFilter ? "В этом статусе у вас нет задач." : "На вас пока не назначено ни одной задачи."}
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
    </div>
  );
}
