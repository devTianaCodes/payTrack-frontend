import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth.js';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setResetUrl('');
    setStatus('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await requestPasswordReset(formData.get('email'));
      setStatus(result.message ?? t('auth.reset.requestSuccess'));
      setResetUrl(result.resetUrl ?? '');
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
          <h1 className="mt-3 text-4xl font-black leading-tight">{t('auth.reset.requestTitle')}</h1>
          <p className="mt-3 text-sm font-bold text-slate-300">{t('auth.reset.requestSubtitle')}</p>
        </div>

        <form className="rounded-[2rem] bg-white p-5 text-ink shadow-soft" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-600" htmlFor="email">
            {t('auth.email')}
          </label>
          <input
            id="email"
            name="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
          ) : null}

          {status ? (
            <p className="mt-4 rounded-2xl bg-mint/15 px-4 py-3 text-sm font-bold text-emerald-800">{status}</p>
          ) : null}

          {resetUrl ? (
            <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
              <Trans
                i18nKey="auth.reset.devLink"
                components={{ resetLink: <Link className="text-coral" to={new URL(resetUrl).pathname + new URL(resetUrl).search} /> }}
              />
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-coral px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.submitting') : t('auth.reset.sendLink')}
          </button>

          <Link className="mt-4 block text-center text-sm font-bold text-slate-500" to="/login">
            {t('auth.reset.backToLogin')}
          </Link>
        </form>
      </section>
    </main>
  );
}
