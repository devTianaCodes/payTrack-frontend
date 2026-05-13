import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext.jsx';
import { currencyOptions, getCurrencyLabel } from '../constants/currencies.js';
import i18n from '../i18n/index.js';
import { useTheme } from '../theme/ThemeContext.jsx';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { updateProfile, user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [form, setForm] = useState(() => getInitialForm(user, isDarkMode));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(getInitialForm(user, isDarkMode));
  }, [isDarkMode, user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const { theme, ...profileDetails } = form;
      const updatedUser = await updateProfile(profileDetails);
      await i18n.changeLanguage(updatedUser.locale);
      setDarkMode(theme === 'dark');
      setMessage(t('settings.saved'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-5 lg:max-w-3xl">
      <div>
        <h2 className="text-2xl font-black md:text-3xl">{t('settings.title')}</h2>
        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.subtitle')}</p>
      </div>

      <form
        className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-soft transition-colors dark:border-slate-600 dark:bg-slate-700/75"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.name')}</span>
            <input
              className={inputClassName}
              maxLength={80}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="PayTrack Demo"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.language')}</span>
            <select
              className={inputClassName}
              value={form.locale}
              onChange={(event) => updateField('locale', event.target.value)}
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.currency')}</span>
            <select
              className={inputClassName}
              value={form.defaultCurrency}
              onChange={(event) => updateField('defaultCurrency', event.target.value)}
            >
              {currencyOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {getCurrencyLabel(currency.code)}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.timezone')}</span>
            <select
              className={inputClassName}
              value={form.timezone}
              onChange={(event) => updateField('timezone', event.target.value)}
            >
              <option value="Europe/Rome">Europe/Rome</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-mist p-4 transition-colors dark:border-slate-600 dark:bg-slate-600">
              <div>
                <p className="font-black">{t('settings.darkMode')}</p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('settings.darkModeDescription')}</p>
              </div>
              <button
                type="button"
                aria-pressed={form.theme === 'dark'}
                className={[
                  'relative h-8 w-14 shrink-0 rounded-full p-1 transition',
                  form.theme === 'dark' ? 'bg-mint' : 'bg-slate-300',
                ].join(' ')}
                onClick={() => updateField('theme', form.theme === 'dark' ? 'light' : 'dark')}
              >
                <span
                  className={[
                    'block h-6 w-6 rounded-full bg-white transition',
                    form.theme === 'dark' ? 'translate-x-6' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          </div>
        </div>

        {message ? <p className="mt-4 rounded-2xl bg-mint/20 px-4 py-3 text-sm font-black text-ink">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-black text-coral">{error}</p> : null}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-5 py-4 font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-900 disabled:translate-y-0 disabled:opacity-60 dark:bg-mint dark:text-ink dark:hover:bg-emerald-300 sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
    </section>
  );
}

function getInitialForm(user, isDarkMode) {
  return {
    name: user?.name ?? '',
    defaultCurrency: user?.defaultCurrency ?? 'USD',
    locale: user?.locale ?? i18n.language ?? 'en',
    timezone: user?.timezone ?? 'Europe/Rome',
    theme: isDarkMode ? 'dark' : 'light',
  };
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500';
