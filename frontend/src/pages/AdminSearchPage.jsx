import { useEffect, useState } from "react";
import { getUsers } from "../api/client";
import usePagedTasks from "../hooks/usePagedTasks";
import Pagination from "../components/Pagination";
import TaskCard from "../components/TaskCard";

export default function AdminSearchPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [usersPage, setUsersPage] = useState(0);
  const usersPerPage = 10;
  const [tasksPage, setTasksPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  // The backend returns at most 100 people, so search there instead of filtering one page locally.
  useEffect(() => {
    let active = true;
    setLoadingUsers(true);
    const timer = setTimeout(() => {
      getUsers({ search: searchQuery.trim() || undefined })
        .then((data) => {
          if (!active) return;
          setUsers(data || []);
          setUsersError(null);
        })
        .catch((err) => active && setUsersError("Ошибка при загрузке пользователей: " + err.message))
        .finally(() => active && setLoadingUsers(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const { tasks, totalPages: tasksTotalPages, loading: loadingTasks, error: tasksError } = usePagedTasks({
    page: tasksPage,
    assignedTo: selectedUserId || undefined,
    enabled: Boolean(selectedUserId),
  });
  const error = usersError || (selectedUserId && tasksError ? "Ошибка при загрузке задач: " + tasksError : null);

  const selectedUser = users.find((u) => String(u.id) === String(selectedUserId));

  return (
    <div className="fade-in">
      <div className="section-title">Поиск участников</div>

      {error && <div className="form-error mb-4">{error}</div>}

      {selectedUserId ? (
        <div>
          <button
            type="button"
            className="btn btn--secondary btn--sm mb-4"
            onClick={() => {
              setSelectedUserId("");
              setTasksPage(0);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Назад к списку участников
          </button>

          {selectedUser && (
            <div className="student-card mb-4" style={{ cursor: "default" }}>
              <div className="student-card__info">
                <div className="student-card__avatar">
                  {(selectedUser.first_name ? selectedUser.first_name.charAt(0) : selectedUser.email.charAt(0)).toUpperCase()}
                </div>
                <div className="student-card__details">
                  <div className="student-card__name">
                    {`${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() || selectedUser.email}
                  </div>
                  <div className="student-card__meta">
                    <span className="student-card__email">{selectedUser.email}</span>
                    {selectedUser.academic_group && (
                      <span className="student-card__badge">{selectedUser.academic_group}</span>
                    )}
                    {selectedUser.committee && (
                      <span className="student-card__badge">{selectedUser.committee}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loadingTasks ? (
            <div className="empty-state">Загрузка задач...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="empty-state__title">Нет задач</div>
              <div className="empty-state__text">У этого участника пока нет назначенных задач.</div>
            </div>
          ) : (
            <>
              {(() => {
                const activeTasks = tasks.filter((t) => t.status === "ASSIGNED" || t.status === "IN_PROGRESS");
                const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
                const otherTasks = tasks.filter(
                  (t) => t.status !== "ASSIGNED" && t.status !== "IN_PROGRESS" && t.status !== "COMPLETED"
                );

                return (
                  <div>
                    {activeTasks.length > 0 && (
                      <div className="mb-4">
                        <h3 className="group-heading">
                          Активные задачи <span className="count-pill">{activeTasks.length}</span>
                        </h3>
                        <div className="task-list">
                          {activeTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      </div>
                    )}

                    {completedTasks.length > 0 && (
                      <div className="mb-4">
                        <h3 className="group-heading">
                          Завершенные <span className="count-pill">{completedTasks.length}</span>
                        </h3>
                        <div className="task-list">
                          {completedTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      </div>
                    )}

                    {otherTasks.length > 0 && (
                      <div className="mb-4">
                        <h3 className="group-heading">
                          Прочее <span className="count-pill">{otherTasks.length}</span>
                        </h3>
                        <div className="task-list">
                          {otherTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <Pagination className="mt-6" page={tasksPage} totalPages={tasksTotalPages} onChange={setTasksPage} />
            </>
          )}
        </div>
      ) : loadingUsers && !searchQuery && users.length === 0 ? (
        <div className="empty-state">Загрузка участников...</div>
      ) : (
        <div>
          <div className="filter-wrapper mb-4">
            <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="form-input filter-select"
              placeholder="Имя, фамилия, группа или email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setUsersPage(0);
              }}
            />
          </div>

          <h3 className="group-heading">
            Участники <span className="count-pill">{users.length}</span>
          </h3>

          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">Ничего не найдено</div>
              <div className="empty-state__text">Попробуйте изменить запрос поиска.</div>
            </div>
          ) : (
            <div className="student-list">
              {(() => {
                const totalUsersPages = Math.ceil(users.length / usersPerPage);
                const paginatedUsers = users.slice(
                  usersPage * usersPerPage,
                  (usersPage + 1) * usersPerPage
                );

                return (
                  <>
                    {paginatedUsers.map((u) => {
                      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
                      const initial = (u.first_name ? u.first_name.charAt(0) : u.email.charAt(0)).toUpperCase();
                      return (
                        <button
                          type="button"
                          key={u.id}
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setTasksPage(0);
                          }}
                          className="student-card"
                        >
                          <div className="student-card__info">
                            <div className="student-card__avatar">
                              {initial}
                            </div>
                            <div className="student-card__details">
                              <div className="student-card__name">{fullName || u.email}</div>
                              <div className="student-card__meta">
                                {fullName && <span className="student-card__email">{u.email}</span>}
                                {u.academic_group && <span className="student-card__badge">{u.academic_group}</span>}
                                {u.committee && <span className="student-card__badge">{u.committee}</span>}
                              </div>
                            </div>
                          </div>
                          <svg className="student-card__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      );
                    })}

                    <Pagination className="mt-4" page={usersPage} totalPages={totalUsersPages} onChange={setUsersPage} />
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
