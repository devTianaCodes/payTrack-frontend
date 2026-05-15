import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './i18n/index.js';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import './styles.css';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const RemindersPage = lazy(() => import('./pages/RemindersPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const SubscriptionPaymentsPage = lazy(() => import('./pages/SubscriptionPaymentsPage.jsx'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'reminders', element: <RemindersPage /> },
          { path: 'subscriptions', element: <SubscriptionsPage /> },
          { path: 'subscriptions/:id/payments', element: <SubscriptionPaymentsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sage px-5 text-ink dark:bg-slate-600 dark:text-white">
      <div className="rounded-[2rem] bg-mist p-6 text-center shadow-soft dark:bg-slate-700">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-300">Loading PayTrack</p>
      </div>
    </div>
  );
}
