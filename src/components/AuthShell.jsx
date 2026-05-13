import { Link } from 'react-router-dom';

export default function AuthShell({ title, actionLabel, alternateLabel, alternateTo }) {
  return (
    <div className="min-h-screen bg-ink px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-between">
        <div>
          <p className="text-sm font-bold text-mint">PayTrack</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{title}</h1>
        </div>

        <form className="rounded-[2rem] bg-white p-5 text-ink shadow-soft">
          <label className="text-sm font-bold text-slate-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="email"
            placeholder="you@example.com"
          />

          <label className="mt-4 block text-sm font-bold text-slate-600" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-mint"
            type="password"
            placeholder="••••••••"
          />

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-coral px-4 py-3 font-black text-white"
          >
            {actionLabel}
          </button>

          <Link className="mt-4 block text-center text-sm font-bold text-slate-500" to={alternateTo}>
            {alternateLabel}
          </Link>
        </form>
      </div>
    </div>
  );
}
