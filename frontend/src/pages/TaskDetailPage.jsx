import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTask, updateTaskStatus, takeTask, deleteTask } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import TaskStatusProgress from "../components/TaskStatusProgress";
import DeadlineProgress from "../components/DeadlineProgress";
import { hapticFeedback } from "../telegram";

const NEXT_STATUS = {
  CREATED: "PUBLISHED",
  PUBLISHED: null,
  ASSIGNED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
};

const NEXT_STATUS_LABEL = {
  PUBLISHED: "Опубликовать свободную задачу",
  IN_PROGRESS: "Взять в работу",
  COMPLETED: "Завершить задачу",
};

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getTask(taskId)
      .then((data) => active && setTask(data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [taskId]);

  // Action failures stay inline so the task remains visible.
  async function runAction(work) {
    hapticFeedback("light");
    setUpdating(true);
    setActionError(null);
    try {
      setTask(await work());
      hapticFeedback("success");
    } catch (err) {
      hapticFeedback("error");
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  const handleStatusChange = (newStatus) => runAction(() => updateTaskStatus(taskId, newStatus));
  const handleTakeTask = () => runAction(() => takeTask(taskId));

  function handleDeleteClick() {
    setShowDeleteModal(true);
  }

  async function confirmDeleteTask() {
    setShowDeleteModal(false);
    hapticFeedback("light");
    setUpdating(true);
    try {
      await deleteTask(taskId);
      hapticFeedback("success");
      navigate("/tasks", { state: { toast: "Задача удалена" } });
    } catch (err) {
      hapticFeedback("error");
      setActionError(err.message);
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--text"></div>
        <div className="skeleton skeleton--card mt-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <button className="btn btn--ghost mb-4" onClick={() => navigate(-1)}>← Назад</button>
        <div className="form-error">{error}</div>
      </div>
    );
  }

  if (!task) return null;

  const nextStatus = NEXT_STATUS[task.status];
  
  // Rights to change task status
  const canManage = Boolean(user?.canManageAllTasks || user?.managedCommitteeIds?.includes(task.committeeId));
  const isAssignee = Boolean(task.assignedTo && user?.id && String(task.assignedTo) === String(user.id));
  const canUpdateStatus = canManage || isAssignee;

  const canTakeTask = Boolean(
    user?.committeeId &&
    !task.assignedTo &&
    ['CREATED', 'PUBLISHED'].includes(task.status) &&
    (!task.committeeId || task.committeeId === user.committeeId)
  );

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="btn btn--icon btn--secondary" aria-label="Назад" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <StatusBadge status={task.status} />
      </div>

      <h1 className="detail-title">{task.name}</h1>

      {/* Таскбар выполнения задачи (этапы) */}
      <div className="detail-progress-card mt-4 mb-4">
        <TaskStatusProgress status={task.status} />
      </div>

      {/* Счетчик дедлайна (строчка, которая уменьшается со временем) */}
      {task.deadline && (
        <div className="detail-deadline-card mb-4">
          <DeadlineProgress
            deadline={task.deadline}
            createdAt={task.createdAt}
            isCompleted={task.status === "COMPLETED"}
          />
        </div>
      )}

      {task.description && (
        <div className="detail-section">
          <div className="detail-section__label">Описание</div>
          <div className="detail-section__content">{task.description}</div>
        </div>
      )}

      <div className="detail-meta">
        <div className="detail-meta__item">
          <div className="detail-meta__label">Создана</div>
          <div className="detail-meta__value">
            {new Date(task.createdAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        
        {task.deadline && (
          <div className="detail-meta__item">
            <div className="detail-meta__label">Дедлайн</div>
            <div className="detail-meta__value">
              {new Date(task.deadline).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {actionError && <div className="form-error mb-4" role="alert">{actionError}</div>}

      {canTakeTask && (
        <div className="detail-actions mb-4">
          <button 
            className="btn btn--primary btn--full" 
            disabled={updating} 
            onClick={handleTakeTask}
          >
            {updating ? "Забираем..." : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Забрать себе
              </>
            )}
          </button>
        </div>
      )}

      {nextStatus && canUpdateStatus && (
        <div className="detail-actions">
          <button 
            className="btn btn--primary btn--full" 
            disabled={updating} 
            onClick={() => handleStatusChange(nextStatus)}
          >
            {updating ? (
              <span className="flex-row" style={{ justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> 
                Обновляем...
              </span>
            ) : NEXT_STATUS_LABEL[nextStatus]}
          </button>
        </div>
      )}

      {canManage && (
        <div className="detail-actions detail-actions--row">
          <button
            className="btn btn--secondary" 
            disabled={updating} 
            onClick={() => navigate(`/tasks/${taskId}/edit`)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Редактировать
          </button>
          {user?.canDeleteTasks && canManage && (
            <button
              className="btn btn--danger"
              disabled={updating} 
              onClick={handleDeleteClick}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Удалить
            </button>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Удаление задачи</h3>
            <p>Вы точно хотите удалить эту задачу? Это действие необратимо.</p>
            <div className="modal-actions">
              <button className="btn btn--secondary" onClick={() => setShowDeleteModal(false)}>Нет</button>
              <button className="btn btn--danger" onClick={confirmDeleteTask}>Да, удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
