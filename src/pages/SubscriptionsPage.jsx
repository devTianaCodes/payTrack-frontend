import { ArchiveRestore, Ban, CreditCard, Filter, Plus, Settings2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getCategories } from '../api/categories.js';
import { getPaymentMethods } from '../api/paymentMethods.js';
import {
  cancelSubscription,
  createSubscription,
  archiveSubscription,
  getSubscriptions,
  restoreSubscription,
  updateSubscription,
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
    paymentMethod: { name: 'Visa', type: 'card', lastFour: '4242' },
    nextRenewalDate: '2026-05-18T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-spotify',
    name: 'Spotify',
    category: { name: 'Entertainment' },
    price: 10.99,
    currency: 'USD',
    paymentMethod: { name: 'PayPal', type: 'paypal' },
    nextRenewalDate: '2026-06-02T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-waking-up',
    name: 'Waking Up',
    category: { name: 'Education' },
    price: 14.99,
    currency: 'USD',
    paymentMethod: { name: 'Mastercard', type: 'card', lastFour: '1188' },
    nextRenewalDate: '2026-06-05T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'demo-gym',
    name: 'Gym',
    category: { name: 'Fitness' },
    price: 45,
    currency: 'USD',
    paymentMethod: { name: 'Visa', type: 'card', lastFour: '4242' },
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
  const [confirmation, setConfirmation] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editId, setEditId] = useState('');
  const [openManageId, setOpenManageId] = useState('');
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

  function requestConfirmation(subscription, action) {
    if (subscription.id.startsWith('demo-')) return;
    setConfirmation({ action, subscriptionId: subscription.id });
  }

  function clearConfirmation() {
    setConfirmation(null);
  }

  async function confirmAction(subscription) {
    if (!confirmation || confirmation.subscriptionId !== subscription.id) return;

    if (confirmation.action === 'cancel') {
      await handleCancel(subscription);
    }

    if (confirmation.action === 'archive') {
      await handleDelete(subscription);
    }

    clearConfirmation();
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
      const updatedSubscription = await archiveSubscription(subscription.id);
      setSubscriptions((current) =>
        current.map((item) => (item.id === updatedSubscription.id ? updatedSubscription : item)),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId('');
    }
  }

  async function handleRestore(subscription) {
    if (subscription.id.startsWith('demo-')) return;
    setActionId(subscription.id);

    try {
      const updatedSubscription = await restoreSubscription(subscription.id);
      setSubscriptions((current) =>
        current.map((item) => (item.id === updatedSubscription.id ? updatedSubscription : item)),
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionId('');
    }
  }

  function startEdit(subscription) {
    if (subscription.id.startsWith('demo-')) return;
    setEditId(subscription.id);
    setEditForm(getEditForm(subscription));
  }

  function cancelEdit() {
    setEditId('');
    setEditForm(null);
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function handleEditSubmit(event, subscription) {
    event.preventDefault();
    setActionId(subscription.id);

    try {
      const updatedSubscription = await updateSubscription(subscription.id, {
        ...editForm,
        price: Number(editForm.price),
        categoryId: editForm.categoryId || null,
        paymentMethodId: editForm.paymentMethodId || null,
        notes: editForm.notes || null,
      });
      setSubscriptions((current) =>
        current.map((item) => (item.id === updatedSubscription.id ? updatedSubscription : item)),
      );
      cancelEdit();
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
              categories={categories}
              confirmation={confirmation?.subscriptionId === subscription.id ? confirmation : null}
              editForm={editId === subscription.id ? editForm : null}
              isManageOpen={openManageId === subscription.id}
              key={subscription.id}
              onCancel={handleCancel}
              onCancelEdit={cancelEdit}
              onClearConfirmation={clearConfirmation}
              onConfirmAction={confirmAction}
              onDelete={handleDelete}
              onEditChange={updateEditForm}
              onRequestConfirmation={requestConfirmation}
              onEditSubmit={handleEditSubmit}
              onRestore={handleRestore}
              onStartEdit={startEdit}
              onToggleManage={() =>
                setOpenManageId((current) => (current === subscription.id ? '' : subscription.id))
              }
              paymentMethods={paymentMethods}
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
            <option value="archived">{t('subscriptions.status.archived')}</option>
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

function SubscriptionCard({
  actionId,
  categories,
  confirmation,
  editForm,
  isManageOpen,
  onCancelEdit,
  onClearConfirmation,
  onConfirmAction,
  onEditChange,
  onEditSubmit,
  onRequestConfirmation,
  onRestore,
  onStartEdit,
  onToggleManage,
  paymentMethods,
  subscription,
}) {
  const { t } = useTranslation();
  const isDemo = subscription.id.startsWith('demo-');
  const isBusy = actionId === subscription.id;
  const status = subscription.status ?? 'active';
  const isArchived = status === 'archived';

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
        {subscription.paymentMethod ? <PaymentMethodBadge paymentMethod={subscription.paymentMethod} /> : null}
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-mint dark:text-ink dark:hover:bg-emerald-300"
          aria-expanded={isManageOpen}
          onClick={onToggleManage}
        >
          <Settings2 size={16} />
          {t('subscriptions.actions.manage')}
        </button>
      </div>
      {isManageOpen ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-3 transition-colors dark:border-slate-600 dark:bg-slate-800/60">
          <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-300">
            {t('subscriptions.manage.title')}
          </p>
          {isArchived ? (
            <button
              type="button"
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-mint px-3 text-sm font-black text-ink disabled:opacity-40"
              disabled={isDemo || isBusy}
              onClick={() => onRestore(subscription)}
            >
              <ArchiveRestore size={16} />
              {t('subscriptions.actions.restore')}
            </button>
          ) : null}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-ink px-3 text-sm font-black text-white disabled:opacity-40 dark:bg-mint dark:text-ink"
              disabled={isDemo || isBusy || isArchived}
              onClick={() => onStartEdit(subscription)}
            >
              <Settings2 size={16} />
              {t('subscriptions.actions.edit')}
            </button>
            <button
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sage px-3 text-sm font-black text-ink disabled:opacity-40 dark:bg-slate-600 dark:text-white"
              disabled={isDemo || isBusy || status === 'cancelled' || isArchived}
              onClick={() => onRequestConfirmation(subscription, 'cancel')}
            >
              <Ban size={16} />
              {t('subscriptions.actions.cancel')}
            </button>
          </div>
          {editForm ? (
            <ManageEditForm
              categories={categories}
              editForm={editForm}
              isSaving={isBusy}
              onCancel={onCancelEdit}
              onChange={onEditChange}
              onSubmit={(event) => onEditSubmit(event, subscription)}
              paymentMethods={paymentMethods}
            />
          ) : null}
          <div className="mt-2">
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-coral/10 px-3 text-sm font-black text-coral disabled:opacity-40"
              disabled={isDemo || isBusy || isArchived}
              onClick={() => onRequestConfirmation(subscription, 'archive')}
            >
              <Trash2 size={16} />
              {t('subscriptions.actions.archive')}
            </button>
          </div>
          {confirmation ? (
            <ActionConfirmation
              action={confirmation.action}
              isBusy={isBusy}
              onCancel={onClearConfirmation}
              onConfirm={() => onConfirmAction(subscription)}
            />
          ) : null}
          <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-300">
            {isDemo ? t('subscriptions.manage.demoNote') : t('subscriptions.manage.note')}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function ActionConfirmation({ action, isBusy, onCancel, onConfirm }) {
  const { t } = useTranslation();
  const isArchive = action === 'archive';

  return (
    <div className="mt-3 rounded-2xl bg-coral/10 p-3 text-coral">
      <p className="text-sm font-black">
        {isArchive ? t('subscriptions.confirm.archiveTitle') : t('subscriptions.confirm.cancelTitle')}
      </p>
      <p className="mt-1 text-xs font-bold">
        {isArchive ? t('subscriptions.confirm.archiveMessage') : t('subscriptions.confirm.cancelMessage')}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="rounded-2xl bg-white px-4 py-3 font-black text-ink dark:bg-slate-700 dark:text-white"
          onClick={onCancel}
        >
          {t('subscriptions.confirm.keep')}
        </button>
        <button
          type="button"
          className="rounded-2xl bg-coral px-4 py-3 font-black text-white disabled:opacity-60"
          disabled={isBusy}
          onClick={onConfirm}
        >
          {isBusy ? t('subscriptions.confirm.working') : t('subscriptions.confirm.confirm')}
        </button>
      </div>
    </div>
  );
}

function ManageEditForm({
  categories,
  editForm,
  isSaving,
  onCancel,
  onChange,
  onSubmit,
  paymentMethods,
}) {
  const { t } = useTranslation();

  return (
    <form className="mt-3 rounded-2xl bg-white/70 p-3 dark:bg-slate-700" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label={t('subscriptions.form.name')}>
          <input
            required
            className={inputClassName}
            maxLength={120}
            value={editForm.name}
            onChange={(event) => onChange('name', event.target.value)}
          />
        </FormField>
        <FormField label={t('subscriptions.form.price')}>
          <input
            required
            className={inputClassName}
            min="0.01"
            step="0.01"
            type="number"
            value={editForm.price}
            onChange={(event) => onChange('price', event.target.value)}
          />
        </FormField>
        <FormField label={t('subscriptions.form.currency')}>
          <select
            className={inputClassName}
            value={editForm.currency}
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
            value={editForm.nextRenewalDate}
            onChange={(event) => onChange('nextRenewalDate', event.target.value)}
          />
        </FormField>
        <FormField label={t('subscriptions.form.frequency')}>
          <select
            className={inputClassName}
            value={editForm.billingFrequency}
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
            value={editForm.categoryId}
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
        <FormField label={t('subscriptions.form.paymentMethod')} className="sm:col-span-2">
          <select
            className={inputClassName}
            value={editForm.paymentMethodId}
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
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" className="rounded-2xl bg-sage px-4 py-3 font-black text-ink dark:bg-slate-600 dark:text-white" onClick={onCancel}>
          {t('actions.cancel')}
        </button>
        <button type="submit" className="rounded-2xl bg-ink px-4 py-3 font-black text-white dark:bg-mint dark:text-ink" disabled={isSaving}>
          {isSaving ? t('subscriptions.form.saving') : t('subscriptions.form.save')}
        </button>
      </div>
    </form>
  );
}

function PaymentMethodBadge({ paymentMethod }) {
  const isCard = paymentMethod.type === 'card';
  const name = isCard ? getCardBrand(paymentMethod) : paymentMethod.name;
  const label = isCard ? `${name} ${maskCard(paymentMethod.lastFour)}` : name;

  return (
    <div className="mt-2 flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-700 dark:text-slate-200">
      <CreditCard size={14} />
      <span>{label}</span>
    </div>
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

function maskCard(lastFour) {
  return lastFour ? `**** ${lastFour}` : '****';
}

function getCardBrand(paymentMethod) {
  return paymentMethod.name
    .replace(/\s+ending\s+\d{4}$/i, '')
    .replace(/\s+\d{4}$/i, '')
    .trim();
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

function getEditForm(subscription) {
  return {
    name: subscription.name,
    price: String(subscription.price),
    currency: subscription.currency,
    billingFrequency: subscription.billingFrequency ?? 'monthly',
    nextRenewalDate: formatInputDate(subscription.nextRenewalDate),
    categoryId: subscription.category?.id ?? '',
    paymentMethodId: subscription.paymentMethod?.id ?? '',
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

function formatInputDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

const inputClassName =
  'mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500';
