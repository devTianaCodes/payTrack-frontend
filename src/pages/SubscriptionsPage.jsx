import { Ban, Filter, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getCategories } from '../api/categories.js';
import { getPaymentMethods } from '../api/paymentMethods.js';
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscriptions,
} from '../api/subscriptions.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ServiceLogo from '../components/ServiceLogo.jsx';
import StateMessage from '../components/StateMessage.jsx';
import { currencyOptions, getCurrencyLabel } from '../constants/currencies.js';

const demoSubscriptions = [
  {
    id: 'demo-netflix',
    name: 'Netflix',
    category: { name: 'Entertainment' },
    price: 15.99,
    currency: 'USD',
    paymentMethod: { name: 'Visa 4242' },
    nextRenewalDate: '2026-05-18T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-spotify',
    name: 'Spotify',
    category: { name: 'Entertainment' },
    price: 10.99,
    currency: 'USD',
    paymentMethod: { name: 'PayPal' },
    nextRenewalDate: '2026-06-02T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-waking-up',
    name: 'Waking Up',
    category: { name: 'Education' },
    price: 14.99,
    currency: 'USD',
    paymentMethod: { name: 'Mastercard 1188' },
    nextRenewalDate: '2026-06-05T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-gym',
    name: 'Gym',
    category: { name: 'Fitness' },
    price: 45,
    currency: 'USD',
    paymentMethod: { name: 'Visa 4242' },
    nextRenewalDate: '2026-06-10T00:00:00.000Z',
    status: 'active',
  },
];

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(searchParams.get('action') === 'add');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(() => getInitialForm(user?.defaultCurrency));
  const [filters, setFilters] = useState(getInitialFilters);

  useEffect(() => {
    let isActive = true;

    Promise.all([getSubscriptions(), getCategories(), getPaymentMethods()])
      .then(([subscriptionData, categoryData, paymentMethodData]) => {
        if (!isActive) return;
        setSubscriptions(subscriptionData);
        setCategories(categoryData);
        setPaymentMethods(paymentMethodData);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  const sourceRows = subscriptions.length > 0 ? subscriptions : demoSubscriptions;
  const rows = filterSubscriptions(sourceRows, filters);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function closeAddForm() {
    setIsAddOpen(false);
    setFormError('');
    setSearchParams({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      const createdSubscription = await createSubscription({
        ...form,
        price: Number(form.price),
        categoryId: form.categoryId || null,
        paymentMethodId: form.paymentMethodId || null,
        notes: form.notes || null,
      });
      setSubscriptions((current) => [createdSubscription, ...current]);
      setForm(getInitialForm(user?.defaultCurrency));
      closeAddForm();
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function handleCancel(subscription) {
    if (subscription.id.startsWith('demo-')) return;
    setActionId(subscription.id);

    try {
      const updatedSubscription = await cancelSubscription(subscription.id);
      setSubscriptions((current) =>
        current.map((item) => (item.id === updatedSubscription.id ? updatedSubscription : item)),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId('');
    }
  }

  async function handleDelete(subscription) {
    if (subscription.id.startsWith('demo-')) return;
    setActionId(subscription.id);

    try {
      await deleteSubscription(subscription.id);
      setSubscriptions((current) => current.filter((item) => item.id !== subscription.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId('');
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black md:text-3xl">{t('subscriptions.title')}</h2>
          <p className="mt-1 hidden text-sm font-bold text-slate-500 dark:text-slate-300 md:block">
            {t('subscriptions.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 p-3 dark:border-slate-500 dark:bg-slate-700"
            aria-label={t('actions.filter')}
            onClick={() => setIsFilterOpen((current) => !current)}
          >
            <Filter size={19} />
          </button>
          <button
            type="button"
            className="rounded-full bg-coral p-3 text-white"
            aria-label={t('actions.addSubscription')}
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={19} />
          </button>
        </div>
      </div>

      {isAddOpen ? (
        <SubscriptionForm
          categories={categories}
          error={formError}
          form={form}
          isSaving={isSaving}
          onChange={updateForm}
          onClose={closeAddForm}
          onSubmit={handleSubmit}
          paymentMethods={paymentMethods}
        />
      ) : null}

      {isFilterOpen ? (
        <SubscriptionFilters
          categories={categories}
          filters={filters}
          onChange={updateFilter}
          onClear={() => setFilters(getInitialFilters())}
          paymentMethods={paymentMethods}
        />
      ) : null}

      {isLoading ? <StateMessage title={t('states.loading')} /> : null}
      {error ? <StateMessage title={t('states.error')} message={error} /> : null}
      {!isLoading && !error && subscriptions.length === 0 ? (
        <StateMessage title={t('subscriptions.emptyTitle')} message={t('subscriptions.emptyMessage')} />
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {rows.map((subscription) => (
            <SubscriptionCard
              actionId={actionId}
              key={subscription.id}
              onCancel={handleCancel}
              onDelete={handleDelete}
              subscription={subscription}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SubscriptionFilters({ categories, filters, onChange, onClear, paymentMethods }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-4 transition-colors dark:border-slate-600 dark:bg-slate-700/75 md:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label={t('subscriptions.filters.status')}>
          <select
            className={inputClassName}
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            <option value="all">{t('subscriptions.filters.all')}</option>
            <option value="active">{t('subscriptions.status.active')}</option>
            <option value="cancelled">{t('subscriptions.status.cancelled')}</option>
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.category')}>
          <select
            className={inputClassName}
            value={filters.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
          >
            <option value="">{t('subscriptions.filters.all')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.paymentMethod')}>
          <select
            className={inputClassName}
            value={filters.paymentMethodId}
            onChange={(event) => onChange('paymentMethodId', event.target.value)}
          >
            <option value="">{t('subscriptions.filters.all')}</option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('subscriptions.filters.search')}>
          <input
            className={inputClassName}
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder="Spotify"
          />
        </FormField>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className="rounded-2xl bg-sage px-5 py-3 font-black text-ink dark:bg-slate-600 dark:text-white" onClick={onClear}>
          {t('subscriptions.filters.clear')}
        </button>
      </div>
    </div>
  );
}

function SubscriptionForm({
  categories,
  error,
  form,
  isSaving,
  onChange,
  onClose,
  onSubmit,
  paymentMethods,
}) {
  const { t } = useTranslation();

  return (
    <form
      className="rounded-[2rem] border border-emerald-100 bg-white/90 p-4 shadow-soft transition-colors dark:border-slate-600 dark:bg-slate-700/80 md:p-5"
      onSubmit={onSubmit}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{t('subscriptions.form.title')}</h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{t('subscriptions.form.subtitle')}</p>
        </div>
        <button type="button" className="rounded-full bg-sage p-2 text-ink dark:bg-slate-600 dark:text-white" onClick={onClose} aria-label={t('actions.close')}>
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label={t('subscriptions.form.name')} className="md:col-span-2 xl:col-span-1">
          <input
            required
            className={inputClassName}
            maxLength={120}
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Netflix"
          />
        </FormField>
        <FormField label={t('subscriptions.form.price')}>
          <input
            required
            className={inputClassName}
            min="0.01"
            step="0.01"
            type="number"
            value={form.price}
            onChange={(event) => onChange('price', event.target.value)}
            placeholder="15.99"
          />
        </FormField>
        <FormField label={t('subscriptions.form.currency')}>
          <select
            required
            className={inputClassName}
            value={form.currency}
            onChange={(event) => onChange('currency', event.target.value)}
          >
            {currencyOptions.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {getCurrencyLabel(currency.code)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.renews')}>
          <input
            required
            className={inputClassName}
            type="date"
            value={form.nextRenewalDate}
            onChange={(event) => onChange('nextRenewalDate', event.target.value)}
          />
        </FormField>
        <FormField label={t('subscriptions.form.frequency')}>
          <select
            className={inputClassName}
            value={form.billingFrequency}
            onChange={(event) => onChange('billingFrequency', event.target.value)}
          >
            <option value="weekly">{t('subscriptions.frequency.weekly')}</option>
            <option value="monthly">{t('subscriptions.frequency.monthly')}</option>
            <option value="quarterly">{t('subscriptions.frequency.quarterly')}</option>
            <option value="yearly">{t('subscriptions.frequency.yearly')}</option>
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.category')}>
          <select
            className={inputClassName}
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
          >
            <option value="">{t('subscriptions.form.none')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.paymentMethod')}>
          <select
            className={inputClassName}
            value={form.paymentMethodId}
            onChange={(event) => onChange('paymentMethodId', event.target.value)}
          >
            <option value="">{t('subscriptions.form.none')}</option>
            {paymentMethods.map((paymentMethod) => (
              <option key={paymentMethod.id} value={paymentMethod.id}>
                {paymentMethod.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={t('subscriptions.form.notes')} className="md:col-span-2">
          <input
            className={inputClassName}
            maxLength={500}
            value={form.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            placeholder={t('subscriptions.form.notesPlaceholder')}
          />
        </FormField>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{error}</p> : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="rounded-2xl bg-sage px-5 py-3 font-black text-ink dark:bg-slate-600 dark:text-white" onClick={onClose}>
          {t('actions.cancel')}
        </button>
        <button type="submit" className="rounded-2xl bg-ink px-5 py-3 font-black text-white dark:bg-mint dark:text-ink" disabled={isSaving}>
          {isSaving ? t('subscriptions.form.saving') : t('subscriptions.form.save')}
        </button>
      </div>
    </form>
  );
}

function FormField({ children, className = '', label }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function SubscriptionCard({ actionId, onCancel, onDelete, subscription }) {
  const { t } = useTranslation();
  const isDemo = subscription.id.startsWith('demo-');
  const isBusy = actionId === subscription.id;
  const status = subscription.status ?? 'active';

  return (
    <article className="rounded-[2rem] border border-emerald-100 bg-white/80 p-4 transition-colors dark:border-slate-600 dark:bg-slate-700/75">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ServiceLogo name={subscription.name} />
          <div>
            <h3 className="font-black">{subscription.name}</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{subscription.category?.name ?? 'Uncategorized'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-ink dark:text-white">{formatMoney(subscription.price, subscription.currency)}</p>
          <p className={status === 'active' ? 'text-xs font-black text-mint' : 'text-xs font-black text-coral'}>
            {t(`subscriptions.status.${status}`)}
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-slate-600 transition-colors dark:bg-slate-600 dark:text-slate-100">
        <p>{t('subscriptions.renews')} {formatDate(subscription.nextRenewalDate)}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
          {subscription.paymentMethod?.name ?? t('subscriptions.form.paymentMethod')}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sage px-3 text-sm font-black text-ink disabled:opacity-40 dark:bg-slate-600 dark:text-white"
          disabled={isDemo || isBusy || status === 'cancelled'}
          onClick={() => onCancel(subscription)}
        >
          <Ban size={16} />
          {t('subscriptions.actions.cancel')}
        </button>
        <button
          type="button"
          className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-coral/10 px-3 text-sm font-black text-coral disabled:opacity-40"
          disabled={isDemo || isBusy}
          onClick={() => onDelete(subscription)}
        >
          <Trash2 size={16} />
          {t('subscriptions.actions.delete')}
        </button>
      </div>
    </article>
  );
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
  }).format(Number(amount));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function getInitialForm(defaultCurrency = 'USD') {
  return {
    name: '',
    price: '',
    currency: defaultCurrency,
    billingFrequency: 'monthly',
    nextRenewalDate: getTomorrowDate(),
    categoryId: '',
    paymentMethodId: '',
    notes: '',
  };
}

function getInitialFilters() {
  return {
    status: 'all',
    categoryId: '',
    paymentMethodId: '',
    search: '',
  };
}

function filterSubscriptions(subscriptions, filters) {
  const search = filters.search.trim().toLowerCase();

  return subscriptions.filter((subscription) => {
    const status = subscription.status ?? 'active';
    const matchesStatus = filters.status === 'all' || status === filters.status;
    const matchesCategory = !filters.categoryId || subscription.category?.id === filters.categoryId;
    const matchesPaymentMethod =
      !filters.paymentMethodId || subscription.paymentMethod?.id === filters.paymentMethodId;
    const matchesSearch = !search || subscription.name.toLowerCase().includes(search);

    return matchesStatus && matchesCategory && matchesPaymentMethod && matchesSearch;
  });
}

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500';
