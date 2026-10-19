import { useState, useEffect } from "react";
import { appHref } from "../shared/telegram.js";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleNames } from "../roles";
import { hapticFeedback } from "../telegram";
import logoUrl from "../shared/aitusa_logo.png";

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const tasksActive = location.pathname === '/tasks' || location.pathname.startsWith('/tasks/');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleTabClick = (path) => {
    hapticFeedback("light");
    navigate(path);
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <a className="app-header__logo" href={appHref("/crm/tasks")} aria-label="AITUSA CRM">
            <img src={logoUrl} alt="AITUSA" className="app-header__logo-img" />
          </a>
        </div>
        <div className="app-header__actions">
          {user && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="app-header__user-badge"
              style={{ cursor: "pointer", border: "none" }}
              title="Сменить профиль / роль"
            >
              <svg viewBox="0 0 24 24" className="app-header__badge-icon" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" />
                <path d="M8 12l3 3 5-5" />
              </svg>
              <span>{roleNames(user) || "Участник"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="toast toast--success flex-row" role="status" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="#10b981" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span style={{ flex: 1, fontWeight: 600 }}>{toast}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar" aria-label="Навигация по задачам">
        <button 
          className={`tab-bar__item ${tasksActive ? 'tab-bar__item--active' : ''}`}
          aria-label="Задачи"
          aria-current={tasksActive ? 'page' : undefined}
          onClick={() => handleTabClick('/tasks')}
        >
          <div className="tab-bar__icon">
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="tab-bar__label">Задачи</span>
        </button>

        <button 
          className={`tab-bar__item ${location.pathname === '/my-tasks' ? 'tab-bar__item--active' : ''}`}
          aria-label="Мои задачи"
          aria-current={location.pathname === '/my-tasks' ? 'page' : undefined}
          onClick={() => handleTabClick('/my-tasks')}
        >
          <div className="tab-bar__icon">
            <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <span className="tab-bar__label">Мои</span>
        </button>

        {user?.canCreateTask && (
          <button 
            className={`tab-bar__item ${location.pathname === '/admin-search' ? 'tab-bar__item--active' : ''}`}
            aria-label="Поиск участников"
            aria-current={location.pathname === '/admin-search' ? 'page' : undefined}
            onClick={() => handleTabClick('/admin-search')}
          >
            <div className="tab-bar__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <span className="tab-bar__label">Поиск</span>
          </button>
        )}
      </nav>
    </div>
  );
}
