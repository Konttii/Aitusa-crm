import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import TaskStatusProgress from "./TaskStatusProgress";
import DeadlineProgress from "./DeadlineProgress";

export default function TaskCard({ task }) {
  const navigate = useNavigate();
  const open = () => navigate(`/tasks/${task.id}`);

  return (
    <div className="task-card" data-status={task.status} role="link" tabIndex={0} onClick={open}
      onKeyDown={(event) => event.key === "Enter" && open()}>
      <div className="task-card__header">
        <h3 className="task-card__title">{task.name}</h3>
        <StatusBadge status={task.status} />
      </div>
      
      {task.description && (
        <div className="task-card__body">
          <p className="task-card__description">{task.description}</p>
        </div>
      )}

      {/* Таскбар выполнения задачи */}
      <div className="task-card__progress-section">
        <TaskStatusProgress status={task.status} compact />
      </div>

      {/* Счетчик дедлайна (строчка, которая уменьшается вместе со временем дедлайна) */}
      <div className="task-card__footer">
        <DeadlineProgress
          deadline={task.deadline}
          createdAt={task.createdAt}
          isCompleted={task.status === "COMPLETED"}
          compact
        />
      </div>
    </div>
  );
}
