import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute() {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sage px-5 text-ink dark:bg-slate-600 dark:text-white">
        <div className="rounded-[2rem] bg-mist p-6 text-center shadow-soft dark:bg-slate-700">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
