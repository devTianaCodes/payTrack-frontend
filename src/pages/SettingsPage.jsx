import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext.jsx';
import { currencyOptions, getCurrencyLabel } from '../constants/currencies.js';
import i18n from '../i18n/index.js';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { updateProfile, user } = useAuth();
  const [form, setForm] = useState(() => getInitialForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(getInitialForm(user));
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const updatedUser = await updateProfile(form);
      await i18n.changeLanguage(updatedUser.locale);
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
        <p className="mt-1 text-sm font-bold text-slate-500">{t('settings.subtitle')}</p>
      </div>

      <form className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-soft" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-500">{t('settings.name')}</span>
            <input
              className={inputClassName}
              maxLength={80}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="PayTrack Demo"
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-500">{t('settings.language')}</span>
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
            <span className="text-sm font-bold text-slate-500">{t('settings.currency')}</span>
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
            <span className="text-sm font-bold text-slate-500">{t('settings.timezone')}</span>
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
        </div>

        {message ? <p className="mt-4 rounded-2xl bg-mint/20 px-4 py-3 text-sm font-black text-ink">{message}</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-black text-coral">{error}</p> : null}

        <div className="mt-5 flex justify-end">
          <button type="submit" className="rounded-2xl bg-ink px-5 py-3 font-black text-white" disabled={isSaving}>
            {isSaving ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
    </section>
  );
}

function getInitialForm(user) {
  return {
    name: user?.name ?? '',
    defaultCurrency: user?.defaultCurrency ?? 'USD',
    locale: user?.locale ?? i18n.language ?? 'en',
    timezone: user?.timezone ?? 'Europe/Rome',
  };
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white';
