export default function StateMessage({ title, message }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="font-black text-ink">{title}</p>
      {message ? <p className="mt-2 text-sm font-bold text-slate-500">{message}</p> : null}
    </div>
  );
}
