import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, getTaskCommittees } from "../api/client";
import AssigneePicker from "../components/AssigneePicker";
import { hapticFeedback } from "../telegram";
import { toApiDeadline } from "../deadline";

export default function CreateTaskPage() {
  const [committees, setCommittees] = useState([]);
  const [committeeId, setCommitteeId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [assignee, setAssignee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getTaskCommittees()
      .then((list) => {
        const items = list || [];
        setCommittees(items);
        if (items.length === 1) {
          setCommitteeId(String(items[0].id));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    hapticFeedback("light");
    setLoading(true);
    setError(null);

    try {
      await createTask({
        name: name.trim(),
        committeeId: committeeId ? Number(committeeId) : null,
        description: description.trim() || null,
        deadline: toApiDeadline(deadline),
        assignedTo: assignee?.id || null,
      });
      hapticFeedback("success");
      window.scrollTo(0, 0);
      navigate("/tasks", {
        replace: true,
        state: { toast: "Задача успешно создана!" },
      });
    } catch (err) {
      hapticFeedback("error");
      setError(err.message || "Не удалось создать задачу");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="detail-header">
        <button type="button" className="btn btn--icon btn--secondary" aria-label="Назад" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <div className="section-title">Новая задача</div>

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

        <div className="form-group">
          <label className="form-label" htmlFor="task-committee">Комитет задачи</label>
          <select
            id="task-committee"
            className="form-select"
            value={committeeId}
            onChange={(event) => {
              const next = event.target.value;
              setCommitteeId(next);
              if (next && assignee?.committeeId !== Number(next)) setAssignee(null);
            }}
          >
            <option value="">Определить автоматически</option>
            {committees.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <AssigneePicker key={committeeId} value={assignee} onChange={setAssignee}
          committeeId={committeeId ? Number(committeeId) : undefined} disabled={loading} />

        {error && <div className="form-error mt-4">{error}</div>}

        <div className="detail-actions">
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? "Создание..." : "Создать задачу"}
          </button>
        </div>
      </form>
    </div>
  );
}
