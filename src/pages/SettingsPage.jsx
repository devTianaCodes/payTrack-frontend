import { Check, ChevronDown, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPaymentMethod, deletePaymentMethod, getPaymentMethods } from '../api/paymentMethods.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { currencyOptions, getCurrencyLabel } from '../constants/currencies.js';
import { languageOptions } from '../constants/languages.js';
import i18n from '../i18n/index.js';
import { useTheme } from '../theme/ThemeContext.jsx';
import { getPaymentMethodLabel } from '../utils/paymentMethods.js';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { updateProfile, user } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [form, setForm] = useState(() => getInitialForm(user, isDarkMode));
  const [isSaving, setIsSaving] = useState(false);
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);
  const [deletePaymentMethodId, setDeletePaymentMethodId] = useState('');
  const [openSelect, setOpenSelect] = useState('');
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

          <div className="block">
            <SettingsSelect
              id="settings-language"
              isOpen={openSelect === 'language'}
              label={t('settings.language')}
              onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'language' : '')}
              options={languageOptions.map((language) => ({
                label: language.name,
                value: language.code,
              }))}
              onChange={(value) => updateField('locale', value)}
              value={form.locale}
            />
          </div>

          <div className="block">
            <SettingsSelect
              id="settings-currency"
              isOpen={openSelect === 'currency'}
              label={t('settings.currency')}
              onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'currency' : '')}
              options={currencyOptions.map((currency) => ({
                label: getCurrencyLabel(currency.code),
                value: currency.code,
              }))}
              onChange={(value) => updateField('defaultCurrency', value)}
              value={form.defaultCurrency}
            />
          </div>

          <div className="block md:col-span-2">
            <SettingsSelect
              id="settings-timezone"
              isOpen={openSelect === 'timezone'}
              label={t('settings.timezone')}
              onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'timezone' : '')}
              options={timezoneOptions}
              onChange={(value) => updateField('timezone', value)}
              value={form.timezone}
            />
          </div>

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

          <div className="block">
            <SettingsSelect
              id="payment-method-type"
              isOpen={openSelect === 'paymentMethodType'}
              label={t('settings.paymentMethods.type')}
              onOpenChange={(isOpen) => setOpenSelect(isOpen ? 'paymentMethodType' : '')}
              options={[
                { label: t('settings.paymentMethods.types.card'), value: 'card' },
                { label: t('settings.paymentMethods.types.paypal'), value: 'paypal' },
                { label: t('settings.paymentMethods.types.bankAccount'), value: 'bank_account' },
                { label: t('settings.paymentMethods.types.cash'), value: 'cash' },
                { label: t('settings.paymentMethods.types.other'), value: 'other' },
              ]}
              onChange={(value) => updatePaymentMethodField('type', value)}
              value={paymentMethodForm.type}
            />
          </div>

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

function SettingsSelect({ id, isOpen, label, onChange, onOpenChange, options, value }) {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  function selectOption(nextValue) {
    onChange(nextValue);
    onOpenChange(false);
  }

  return (
    <div className="relative">
      <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{label}</span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        className={`${inputClassName} flex items-center justify-between gap-3 text-left`}
        onClick={() => onOpenChange(!isOpen)}
      >
        <span id={`${id}-label`} className="sr-only">
          {label}
        </span>
        <span id={`${id}-value`} className="truncate">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={isOpen ? 'shrink-0 rotate-180 transition' : 'shrink-0 transition'}
          size={18}
        />
      </button>
      {isOpen ? (
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-2 shadow-soft dark:border-slate-600 dark:bg-slate-700"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-black transition',
                  isSelected
                    ? 'bg-mint text-ink dark:bg-ink dark:text-white'
                    : 'text-slate-600 hover:bg-mint/70 hover:text-ink dark:text-slate-100 dark:hover:bg-ink dark:hover:text-white',
                ].join(' ')}
                key={option.value}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {isSelected ? <Check size={16} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
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
  const displayName = getPaymentMethodLabel(paymentMethod);

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

function getPaymentMethodTypeKey(type) {
  if (type === 'bank_account') return 'bankAccount';
  return type;
}

const timezoneOptions = [
  { label: 'Europe/Rome', value: 'Europe/Rome' },
  { label: 'UTC', value: 'UTC' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'America/New_York', value: 'America/New_York' },
];

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500';
