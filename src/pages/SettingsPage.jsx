import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index.js';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-black">{t('settings.title')}</h2>

      <div className="rounded-[2rem] border border-slate-100 p-5">
        <label className="text-sm font-bold text-slate-500" htmlFor="language">
          {t('settings.language')}
        </label>
        <select
          id="language"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-mint"
          value={i18n.language}
          onChange={(event) => i18n.changeLanguage(event.target.value)}
        >
          <option value="en">English</option>
          <option value="it">Italiano</option>
        </select>
      </div>

      <div className="rounded-[2rem] border border-slate-100 p-5">
        <p className="text-sm font-bold text-slate-500">{t('settings.currency')}</p>
        <p className="mt-2 text-2xl font-black">USD</p>
      </div>
    </section>
  );
}
