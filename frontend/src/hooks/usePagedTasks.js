import { useEffect, useState } from "react";
import { getTasks } from "../api/client";

// Refetches on focus; a late response from an outdated filter or page never overwrites a newer one.
export default function usePagedTasks({ page, size = 10, status, assignedTo, unassigned, enabled = true }) {
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    let current = true;
    const load = () => {
      setLoading(true);
      getTasks({ page, size, status, assignedTo, unassigned })
        .then((data) => {
          if (!current) return;
          setTasks(data.content);
          setTotalPages(data.totalPages || 1);
          setError(null);
        })
        .catch((err) => current && setError(err.message))
        .finally(() => current && setLoading(false));
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      current = false;
      window.removeEventListener("focus", load);
    };
  }, [page, size, status, assignedTo, unassigned, enabled]);

  return { tasks, totalPages, loading, error };
}
