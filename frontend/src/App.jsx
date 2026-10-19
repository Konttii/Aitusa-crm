import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { appHref } from "./shared/telegram.js";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import LoginPage from "./pages/LoginPage";
import TaskListPage from "./pages/TaskListPage";
import MyTasksPage from "./pages/MyTasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import EditTaskPage from "./pages/EditTaskPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminSearchPage from "./pages/AdminSearchPage";

const ROUTER_BASENAME = (import.meta.env.BASE_URL || "/crm/").replace(/\/$/, "") || "/crm";

function AppRoutes() {
  const { loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URL(appHref(window.location.href), window.location.origin).hash;
    if (hash !== location.hash) {
      navigate({ pathname: location.pathname, search: location.search, hash }, {
        replace: true,
        state: location.state,
      });
    }
  }, [location, navigate]);

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/my-tasks" element={<MyTasksPage />} />
        <Route path="/tasks/new" element={<ProtectedRoute managersOnly><CreateTaskPage /></ProtectedRoute>} />
        <Route path="/tasks/:taskId/edit" element={<ProtectedRoute managersOnly><EditTaskPage /></ProtectedRoute>} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/admin-search" element={<ProtectedRoute managersOnly><AdminSearchPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={ROUTER_BASENAME}>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
