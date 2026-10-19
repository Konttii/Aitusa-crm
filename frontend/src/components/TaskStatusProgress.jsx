import { useMemo } from "react";

const STEPS = [
  { key: "CREATED", label: "Создана", percent: 25 },
  { key: "ASSIGNED", label: "Назначена", percent: 50 },
  { key: "IN_PROGRESS", label: "В работе", percent: 75 },
  { key: "COMPLETED", label: "Завершена", percent: 100 },
];

export default function TaskStatusProgress({ status = "CREATED", compact = false }) {
  const { currentStepIndex, percent, label } = useMemo(() => {
    switch (status) {
      case "PUBLISHED":
        return { currentStepIndex: 0, percent: 35, label: "Опубликована" };
      case "ASSIGNED":
        return { currentStepIndex: 1, percent: 50, label: "Назначена" };
      case "IN_PROGRESS":
        return { currentStepIndex: 2, percent: 75, label: "В работе" };
      case "COMPLETED":
        return { currentStepIndex: 3, percent: 100, label: "Завершена" };
      case "CREATED":
      default:
        return { currentStepIndex: 0, percent: 25, label: "Создана" };
    }
  }, [status]);

  if (compact) {
    return (
      <div className="task-status-bar task-status-bar--compact">
        <div className="task-status-bar__header">
          <span className="task-status-bar__title">Прогресс задачи</span>
          <span className={`task-status-bar__pct task-status-bar__pct--${status.toLowerCase()}`}>
            {percent}% · {label}
          </span>
        </div>
        <div className="task-status-bar__track">
          <div
            className={`task-status-bar__fill task-status-bar__fill--${status.toLowerCase()}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="task-status-bar task-status-bar--stepper">
      <div className="task-status-bar__header">
        <span className="task-status-bar__title">Этап выполнения</span>
        <span className={`task-status-bar__pct task-status-bar__pct--${status.toLowerCase()}`}>
          {percent}% завершено
        </span>
      </div>

      <div className="task-status-stepper">
        {STEPS.map((step, idx) => {
          const isPassed = currentStepIndex >= idx;
          const isCurrent = currentStepIndex === idx;

          return (
            <div
              key={step.key}
              className={`task-status-step ${
                isPassed ? "task-status-step--passed" : ""
              } ${isCurrent ? "task-status-step--current" : ""}`}
            >
              <div className="task-status-step__indicator">
                <span className="task-status-step__dot">
                  {isPassed ? (
                    <svg viewBox="0 0 24 24" className="task-status-step__check">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`task-status-step__line ${
                      currentStepIndex > idx ? "task-status-step__line--filled" : ""
                    }`}
                  />
                )}
              </div>
              <span className="task-status-step__label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
