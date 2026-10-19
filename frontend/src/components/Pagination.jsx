export default function Pagination({ page, totalPages, onChange, className = "" }) {
  if (totalPages <= 1) return null;
  return (
    <div className={`pagination ${className}`}>
      <button type="button" className="btn btn--secondary btn--sm" disabled={page <= 0}
        onClick={() => onChange(page - 1)}>
        Назад
      </button>
      <span className="pagination__info">{page + 1} / {totalPages}</span>
      <button type="button" className="btn btn--secondary btn--sm" disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}>
        Вперёд
      </button>
    </div>
  );
}
