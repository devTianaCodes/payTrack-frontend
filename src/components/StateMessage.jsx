export default function StateMessage({ title, message }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-emerald-200 bg-white/70 px-5 py-8 text-center transition-colors dark:border-slate-500 dark:bg-slate-700/70">
      <p className="font-black text-ink dark:text-white">{title}</p>
      {message ? <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-300">{message}</p> : null}
    </div>
  );
}
