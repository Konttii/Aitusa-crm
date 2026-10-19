const STATUS_CONFIG = {
  CREATED: { label: "Создана", key: "CREATED" },
  ASSIGNED: { label: "Назначена", key: "ASSIGNED" },
  PUBLISHED: { label: "Опубликована", key: "PUBLISHED" },
  IN_PROGRESS: { label: "В работе", key: "IN_PROGRESS" },
  COMPLETED: { label: "Завершена", key: "COMPLETED" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, key: "CREATED" };

  return (
    <span className={`status-badge status-badge--${config.key}`}>
      <span className="status-badge__dot"></span>
      {config.label}
    </span>
  );
}
