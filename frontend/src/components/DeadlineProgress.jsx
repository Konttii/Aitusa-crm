import { useMemo } from "react";

export default function DeadlineProgress({ deadline, createdAt, isCompleted = false, compact = false }) {
  const data = useMemo(() => {
    if (!deadline) {
      return { hasDeadline: false };
    }

    const deadTime = new Date(deadline).getTime();
    if (isNaN(deadTime)) {
      return { hasDeadline: false };
    }

    const createdTime = createdAt ? new Date(createdAt).getTime() : deadTime - (7 * 24 * 3600 * 1000);
    const now = Date.now();

    const totalDuration = Math.max(1000 * 60, deadTime - createdTime);
    const timeRemaining = deadTime - now;
    const isOverdue = timeRemaining <= 0 && !isCompleted;

    // Remaining percentage for the shrinking line (from 100% at creation down to 0% at deadline)
    let percentRemaining = Math.max(0, Math.min(100, Math.round((timeRemaining / totalDuration) * 100)));

    if (isCompleted) {
      return {
        hasDeadline: true,
        isCompleted: true,
        isOverdue: false,
        label: "Выполнена",
        percent: 100,
        variant: "completed",
        formattedDeadline: new Date(deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
      };
    }

    // Format human-friendly time text
    let timeText = "";
    const absDiff = Math.abs(timeRemaining);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (isOverdue) {
      if (days > 0) {
        timeText = `Просрочено на ${days} дн. ${hours} ч.`;
      } else if (hours > 0) {
        timeText = `Просрочено на ${hours} ч. ${minutes} мин.`;
      } else {
        timeText = `Просрочено на ${Math.max(1, minutes)} мин.`;
      }
    } else {
      if (days > 0) {
        timeText = `Осталось ${days} дн. ${hours} ч.`;
      } else if (hours > 0) {
        timeText = `Осталось ${hours} ч. ${minutes} мин.`;
      } else {
        timeText = `Осталось ${Math.max(1, minutes)} мин.`;
      }
    }

    let variant = "normal";
    if (isOverdue) {
      variant = "overdue";
    } else if (percentRemaining <= 20 || timeRemaining < 24 * 3600 * 1000) {
      variant = "urgent";
    } else if (percentRemaining <= 50) {
      variant = "warning";
    }

    return {
      hasDeadline: true,
      isCompleted: false,
      isOverdue,
      timeText,
      percent: isOverdue ? 100 : percentRemaining,
      variant,
      formattedDeadline: new Date(deadline).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, [deadline, createdAt, isCompleted]);

  if (!data.hasDeadline) {
    if (compact) {
      return (
        <div className="deadline-tracker deadline-tracker--compact">
          <span className="deadline-tracker__no-deadline">Без дедлайна</span>
        </div>
      );
    }
    return null;
  }

  if (compact) {
    return (
      <div className={`deadline-tracker deadline-tracker--compact deadline-tracker--${data.variant}`}>
        <div className="deadline-tracker__header">
          <span className="deadline-tracker__info">
            <svg viewBox="0 0 24 24" className="deadline-tracker__icon" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="deadline-tracker__date">{data.formattedDeadline}</span>
          </span>
          <span className={`deadline-tracker__badge deadline-tracker__badge--${data.variant}`}>
            {data.timeText || "Выполнена"}
          </span>
        </div>
        <div className="deadline-tracker__track">
          <div
            className={`deadline-tracker__fill deadline-tracker__fill--${data.variant}`}
            style={{ width: `${data.percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`deadline-tracker deadline-tracker--detailed deadline-tracker--${data.variant}`}>
      <div className="deadline-tracker__header">
        <div className="deadline-tracker__meta">
          <svg viewBox="0 0 24 24" className="deadline-tracker__icon" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="deadline-tracker__title">
            {data.isOverdue ? "Срок сдачи истёк" : "Счётчик дедлайна"}
          </span>
          <span className="deadline-tracker__date">({data.formattedDeadline})</span>
        </div>
        <span className={`deadline-tracker__badge deadline-tracker__badge--${data.variant}`}>
          {data.timeText || "Выполнена"}
        </span>
      </div>

      <div className="deadline-tracker__track">
        <div
          className={`deadline-tracker__fill deadline-tracker__fill--${data.variant}`}
          style={{ width: `${data.percent}%` }}
        />
      </div>

      <div className="deadline-tracker__footer">
        <span className="deadline-tracker__subtext">
          {data.isOverdue
            ? "Дедлайн задачи был нарушен"
            : data.isCompleted
            ? "Задача успешно сдана"
            : `Остаток времени по таймлайну: ${data.percent}%`}
        </span>
      </div>
    </div>
  );
}
