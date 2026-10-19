import { useEffect, useId, useRef, useState } from "react";
import { getUsers } from "../api/client";
import { hapticFeedback } from "../telegram";

const SELECT_MESSAGE = "Выберите исполнителя из списка или очистите поле";

function userName(user) {
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Исполнитель";
}

export default function AssigneePicker({ value, onChange, committeeId, disabled = false }) {
  const inputId = useId();
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const closeOutside = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useEffect(() => {
    inputRef.current?.setCustomValidity(!value && query.trim() ? SELECT_MESSAGE : "");
  }, [query, value]);

  useEffect(() => {
    if (!open || value || disabled) return;
    let active = true;
    setLoading(true);
    setError("");
    setUsers([]);
    const timer = setTimeout(async () => {
      try {
        const result = await getUsers({ search: query.trim() || undefined, committeeId, includeSelf: true });
        if (active) setUsers(result || []);
      } catch (err) {
        if (active) setError(err.message || "Не удалось загрузить исполнителей");
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query, value, committeeId, disabled]);

  function select(user) {
    onChange(user);
    setQuery("");
    setOpen(false);
    hapticFeedback("light");
  }

  return (
    <div className="form-group" ref={boxRef}>
      <label className="form-label" htmlFor={value ? undefined : inputId}>Исполнитель (необязательно)</label>
      {value ? (
        <div className="selected-user-pill">
          <div className="selected-user-pill__info">
            <div className="selected-user-pill__name">{userName(value)}</div>
            <div className="selected-user-pill__sub">
              {value.email}{value.committee ? ` · ${value.committee}` : ""}
            </div>
          </div>
          <button type="button" className="selected-user-pill__clear" disabled={disabled}
            aria-label="Убрать исполнителя" onClick={() => {
              onChange(null);
              setQuery("");
              setOpen(true);
              hapticFeedback("light");
            }}>✕</button>
        </div>
      ) : (
        <>
          <input id={inputId} ref={inputRef} className="form-input" value={query} disabled={disabled}
            autoComplete="off" placeholder="Имя, фамилия, группа или email..."
            aria-expanded={open} aria-controls={`${inputId}-results`}
            onFocus={() => setOpen(true)} onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }} onChange={(event) => {
              const next = event.target.value;
              event.target.setCustomValidity(next.trim() ? SELECT_MESSAGE : "");
              setQuery(next);
              setOpen(true);
            }} />
          {open && (
            <div id={`${inputId}-results`} className="autocomplete-dropdown" aria-live="polite">
              {loading ? <div className="autocomplete-item text-muted">Загрузка исполнителей…</div>
                : error ? <div className="autocomplete-item form-error" role="alert">{error}</div>
                : users.length === 0 ? <div className="autocomplete-item text-muted">Ничего не найдено</div>
                : users.map((user) => (
                  <button key={user.id} type="button" className="autocomplete-item"
                    disabled={disabled} onClick={() => select(user)}>
                    <div className="autocomplete-item__main">
                      <div className="autocomplete-item__name">{userName(user)}</div>
                      <div className="autocomplete-item__sub">
                        {user.email}{user.academic_group ? ` · ${user.academic_group}` : ""}
                      </div>
                    </div>
                    {user.committee && <span className="autocomplete-item__badge">{user.committee}</span>}
                  </button>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
