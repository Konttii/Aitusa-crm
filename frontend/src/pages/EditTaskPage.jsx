import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTask, updateTask } from "../api/client";
import AssigneePicker from "../components/AssigneePicker";
import { hapticFeedback } from "../telegram";
import { toApiDeadline, toLocalInput } from "../deadline";

export default function EditTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [assignee, setAssignee] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  const [originalTask, setOriginalTask] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    let active = true;
    setFetching(true);
    setOriginalTask(null);
    setError(null);
    getTask(taskId)
      .then((task) => {
        if (!active) return;
        if (task.assignedTo && !task.assignee) {
          throw new Error("Не удалось загрузить данные исполнителя. Обновите страницу.");
        }
        setOriginalTask(task);
        setName(task.name);
        setDescription(task.description || "");
        setDeadline(toLocalInput(task.deadline));
        setAssignee(task.assignee);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setFetching(false); });
    return () => { active = false; };
  }, [taskId]);

  async function handleSubmit(e) {
    e.preventDefault();

    let hasChanged = false;
    if (originalTask) {
      const dt = toApiDeadline(deadline);
      const currentDesc = description || null;
      const currentAssigned = assignee?.id || null;
      const dtOriginal = originalTask.deadline ? new Date(originalTask.deadline).toISOString() : null;

      hasChanged =
        name.trim() !== originalTask.name ||
        currentDesc !== (originalTask.description || null) ||
        dt !== dtOriginal ||
        String(currentAssigned || "") !== String(originalTask.assignedTo || "");
    }

    if (hasChanged) {
      setShowSaveModal(true);
    } else {
      navigate(`/tasks/${taskId}`);
    }
  }

  async function confirmSaveTask() {
    setShowSaveModal(false);
    hapticFeedback("light");
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        deadline: toApiDeadline(deadline),
      };
      if ((assignee?.id || null) !== (originalTask.assignedTo || null)) {
        payload.assignedTo = assignee?.id || null;
      }
      await updateTask(taskId, payload);
      hapticFeedback("success");
      window.scrollTo(0, 0);
      navigate(`/tasks/${taskId}`, {
        replace: true,
        state: { toast: "Изменения успешно сохранены!" },
      });
    } catch (err) {
      hapticFeedback("error");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="fade-in">
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--text"></div>
      </div>
    );
  }

  if (!originalTask) {
    return <div className="detail-page">
      <button type="button" className="btn btn--ghost mb-4" onClick={() => navigate(-1)}>← Назад</button>
      <div className="form-error" role="alert">{error || "Не удалось загрузить задачу"}</div>
    </div>;
  }

  return (
    <div className="fade-in">
      <div className="detail-header">
        <button type="button" className="btn btn--icon btn--secondary" aria-label="Назад" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <div className="section-title">Редактирование задачи</div>

      <form onSubmit={handleSubmit} className="form-stack mt-6">
        <div className="form-group">
          <label className="form-label">Название *</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Что нужно сделать?"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Описание</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробности задачи..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Дедлайн</label>
          <input
            className="form-input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <AssigneePicker value={assignee} disabled={loading} onChange={(user) => {
          setAssignee(user);
          setError(null);
        }} />
        {assignee?.committeeId && assignee.committeeId !== originalTask?.committeeId && (
          <p className="text-muted">Задача будет передана в комитет «{assignee.committee}».</p>
        )}

        {error && <div className="form-error mt-4">{error}</div>}

        <div className="detail-actions">
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Сохранение</h3>
            <p>Вы точно хотите внести изменения?</p>
            <div className="modal-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setShowSaveModal(false)}>Нет</button>
              <button type="button" className="btn btn--primary" onClick={confirmSaveTask}>Да, сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
