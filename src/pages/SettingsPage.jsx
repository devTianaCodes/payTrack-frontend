import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPaymentMethod, deletePaymentMethod, getPaymentMethods } from '../api/paymentMethods.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { currencyOptions, getCurrencyLabel } from '../constants/currencies.js';
import { languageOptions } from '../constants/languages.js';
import i18n from '../i18n/index.js';
import { useTheme } from '../theme/ThemeContext.jsx';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { updateProfile, user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [form, setForm] = useState(() => getInitialForm(user, isDarkMode));
  const [isSaving, setIsSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [deletePaymentMethodId, setDeletePaymentMethodId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodForm, setPaymentMethodForm] = useState(getInitialPaymentMethodForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(getInitialForm(user, isDarkMode));
  }, [isDarkMode, user]);

  useEffect(() => {
    let isActive = true;

    getPaymentMethods()
      .then((data) => {
        if (isActive) setPaymentMethods(data);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      });

    return () => {
      isActive = false;
    };
  }, []);

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

  function updatePaymentMethodField(field, value) {
    setPaymentMethodForm((current) => ({ ...current, [field]: value }));
  }

  async function handlePaymentMethodSubmit(event) {
    event.preventDefault();
    setIsPaymentSaving(true);
    setMessage('');
    setError('');

    try {
      const createdPaymentMethod = await createPaymentMethod({
        ...paymentMethodForm,
        lastFour: paymentMethodForm.type === 'card' ? paymentMethodForm.lastFour || null : null,
      });
      setPaymentMethods((current) => [...current, createdPaymentMethod].sort(comparePaymentMethods));
      setPaymentMethodForm(getInitialPaymentMethodForm());
      setMessage(t('settings.paymentMethods.saved'));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsPaymentSaving(false);
    }
  }

  async function handlePaymentMethodDelete(paymentMethod) {
    setError('');
    setMessage('');

    try {
      await deletePaymentMethod(paymentMethod.id);
      setPaymentMethods((current) => current.filter((item) => item.id !== paymentMethod.id));
      setMessage(t('settings.paymentMethods.deleted'));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function requestPaymentMethodDelete(paymentMethod) {
    setDeletePaymentMethodId(paymentMethod.id);
  }

  function cancelPaymentMethodDelete() {
    setDeletePaymentMethodId('');
  }

  async function confirmPaymentMethodDelete(paymentMethod) {
    await handlePaymentMethodDelete(paymentMethod);
    cancelPaymentMethodDelete();
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
              {languageOptions.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
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

      <section className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 shadow-soft transition-colors dark:border-slate-600 dark:bg-slate-700/75">
        <div>
          <h3 className="text-lg font-black">{t('settings.paymentMethods.title')}</h3>
          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">
            {t('settings.paymentMethods.subtitle')}
          </p>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_120px_auto]" onSubmit={handlePaymentMethodSubmit}>
          <label className="block">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">
              {t('settings.paymentMethods.name')}
            </span>
            <input
              className={inputClassName}
              maxLength={80}
              placeholder="Visa"
              required
              value={paymentMethodForm.name}
              onChange={(event) => updatePaymentMethodField('name', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">
              {t('settings.paymentMethods.type')}
            </span>
            <select
              className={inputClassName}
              value={paymentMethodForm.type}
              onChange={(event) => updatePaymentMethodField('type', event.target.value)}
            >
              <option value="card">{t('settings.paymentMethods.types.card')}</option>
              <option value="paypal">{t('settings.paymentMethods.types.paypal')}</option>
              <option value="bank_account">{t('settings.paymentMethods.types.bankAccount')}</option>
              <option value="cash">{t('settings.paymentMethods.types.cash')}</option>
              <option value="other">{t('settings.paymentMethods.types.other')}</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">
              {t('settings.paymentMethods.lastFour')}
            </span>
            <input
              className={inputClassName}
              disabled={paymentMethodForm.type !== 'card'}
              inputMode="numeric"
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="4242"
              value={paymentMethodForm.lastFour}
              onChange={(event) => updatePaymentMethodField('lastFour', event.target.value.replace(/\D/g, ''))}
            />
          </label>

          <button
            type="submit"
            className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-mint px-4 font-black text-ink disabled:opacity-60"
            disabled={isPaymentSaving}
          >
            <Plus size={18} />
            {isPaymentSaving ? t('settings.paymentMethods.saving') : t('settings.paymentMethods.add')}
          </button>
        </form>

        <div className="mt-5 grid gap-3">
          {paymentMethods.length === 0 ? (
            <div className="rounded-2xl bg-mist p-4 text-sm font-bold text-slate-500 transition-colors dark:bg-slate-600 dark:text-slate-300">
              {t('settings.paymentMethods.empty')}
            </div>
          ) : null}
          {paymentMethods.map((paymentMethod) => (
            <PaymentMethodRow
              isConfirmingDelete={deletePaymentMethodId === paymentMethod.id}
              key={paymentMethod.id}
              onCancelDelete={cancelPaymentMethodDelete}
              onConfirmDelete={confirmPaymentMethodDelete}
              onRequestDelete={requestPaymentMethodDelete}
              paymentMethod={paymentMethod}
            />
          ))}
        </div>
      </section>
    </section>
  );
}

function PaymentMethodRow({
  isConfirmingDelete,
  onCancelDelete,
  onConfirmDelete,
  onRequestDelete,
  paymentMethod,
}) {
  const { t } = useTranslation();
  const isCard = paymentMethod.type === 'card';
  const displayName = isCard ? `${cleanCardName(paymentMethod.name)} ${maskCard(paymentMethod.lastFour)}` : paymentMethod.name;

  return (
    <div className="rounded-2xl bg-mist p-4 transition-colors dark:bg-slate-600">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-2 text-ink dark:bg-slate-700 dark:text-white">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="font-black">{displayName}</p>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">
              {t(`settings.paymentMethods.types.${getPaymentMethodTypeKey(paymentMethod.type)}`)}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full bg-coral/10 p-3 text-coral"
          aria-label={t('settings.paymentMethods.delete')}
          onClick={() => onRequestDelete(paymentMethod)}
        >
          <Trash2 size={18} />
        </button>
      </div>
      {isConfirmingDelete ? (
        <div className="mt-3 rounded-2xl bg-coral/10 p-3 text-coral">
          <p className="text-sm font-black">{t('settings.paymentMethods.confirmTitle')}</p>
          <p className="mt-1 text-xs font-bold">{t('settings.paymentMethods.confirmMessage')}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-2xl bg-white px-4 py-3 font-black text-ink dark:bg-slate-700 dark:text-white"
              onClick={onCancelDelete}
            >
              {t('settings.paymentMethods.keep')}
            </button>
            <button
              type="button"
              className="rounded-2xl bg-coral px-4 py-3 font-black text-white"
              onClick={() => onConfirmDelete(paymentMethod)}
            >
              {t('settings.paymentMethods.confirmDelete')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
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

function getInitialPaymentMethodForm() {
  return {
    name: '',
    type: 'card',
    lastFour: '',
  };
}

function comparePaymentMethods(left, right) {
  return left.name.localeCompare(right.name);
}

function cleanCardName(name) {
  return name.replace(/\s+ending\s+\d{4}$/i, '').replace(/\s+\d{4}$/i, '').trim();
}

function maskCard(lastFour) {
  return lastFour ? `**** ${lastFour}` : '****';
}

function getPaymentMethodTypeKey(type) {
  if (type === 'bank_account') return 'bankAccount';
  return type;
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500';
