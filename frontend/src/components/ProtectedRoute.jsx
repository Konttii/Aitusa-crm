import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// managersOnly follows the backend's canCreateTask flag instead of a copied role list.
export default function ProtectedRoute({ children, managersOnly = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (managersOnly && !user?.canCreateTask) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
}
