import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <div className="empty-state__title">Страница не найдена</div>
      <p className="empty-state__text mb-4">Запрошенный раздел не существует.</p>
      <Link className="btn btn--primary" to="/tasks">Вернуться к задачам</Link>
    </div>
  );
}
