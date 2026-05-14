import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AuthShell({
  title,
  actionLabel,
  alternateLabel,
  alternateTo,
  error,
  includeName = false,
  isSubmitting = false,
  onSubmit,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 py-8 text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-sm font-bold text-mint">PayTrack</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{title}</h1>
        </div>

        <form className="rounded-[2rem] bg-white p-5 text-ink shadow-soft" onSubmit={onSubmit}>
          {includeName ? (
            <>
              <label className="text-sm font-bold text-slate-600" htmlFor="name">
                {t('auth.name')}
              </label>
              <input
                id="name"
                name="name"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
                type="text"
                placeholder="Tiana"
                autoComplete="name"
              />
            </>
          ) : null}

          <label
            className={['block text-sm font-bold text-slate-600', includeName ? 'mt-4' : ''].join(' ')}
            htmlFor="email"
          >
            {t('auth.email')}
          </label>
          <input
            id="email"
            name="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="text"
            inputMode="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className="mt-4 block text-sm font-bold text-slate-600" htmlFor="password">
            {t('auth.password')}
          </label>
          <input
            id="password"
            name="password"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="password"
            placeholder="••••••••"
            autoComplete={includeName ? 'new-password' : 'current-password'}
            minLength={8}
            required
          />

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-coral px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('auth.submitting') : actionLabel}
          </button>

          <Link className="mt-4 block text-center text-sm font-bold text-slate-500" to={alternateTo}>
            {alternateLabel}
          </Link>
        </form>
      </div>
    </div>
  );
}
