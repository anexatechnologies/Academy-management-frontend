import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  requiredPermissions?: string[];
}

const ProtectedRoute = ({ requiredPermissions }: ProtectedRouteProps) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every((req) => {
      const [module, action] = req.split(':');
      return auth.user?.permissions?.some(
        (p) => p.module === module && (p.action === action || p.action === 'manage')
      );
    });

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
