import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError(t('auth.reset.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({ token, password });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-8 text-white">
      <section className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-sm font-bold text-mint">{t('app.name')}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{t('auth.reset.confirmTitle')}</h1>
          <p className="mt-3 text-sm font-bold text-slate-300">{t('auth.reset.confirmSubtitle')}</p>
        </div>

        <form className="rounded-[2rem] bg-white p-5 text-ink shadow-soft" onSubmit={handleSubmit}>
          {!token ? (
            <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {t('auth.reset.missingToken')}
            </p>
          ) : null}

          <label className="block text-sm font-bold text-slate-600" htmlFor="password">
            {t('auth.reset.newPassword')}
          </label>
          <input
            id="password"
            name="password"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
          />

          <label className="mt-4 block text-sm font-bold text-slate-600" htmlFor="confirmPassword">
            {t('auth.reset.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-coral px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? t('auth.submitting') : t('auth.reset.updatePassword')}
          </button>

          <Link className="mt-4 block text-center text-sm font-bold text-slate-500" to="/login">
            {t('auth.reset.backToLogin')}
          </Link>
        </form>
      </section>
    </main>
  );
}
