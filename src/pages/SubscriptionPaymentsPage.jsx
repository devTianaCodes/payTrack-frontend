import { ArrowLeft, CalendarDays, History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { getSubscription, getSubscriptionPayments } from '../api/subscriptions.js';
import ServiceLogo from '../components/ServiceLogo.jsx';
import StateMessage from '../components/StateMessage.jsx';

export default function SubscriptionPaymentsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const paymentYears = useMemo(() => getPaymentYears(payments), [payments]);
  const visiblePayments = useMemo(
    () => filterPaymentsByYear(payments, selectedYear),
    [payments, selectedYear],
  );

  useEffect(() => {
    let isActive = true;

    Promise.all([getSubscription(id), getSubscriptionPayments(id)])
      .then(([subscriptionData, paymentData]) => {
        if (!isActive) return;
        setSubscription(subscriptionData);
        setPayments(paymentData);
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
  }, [id]);

  return (
    <section className="space-y-5">
      <Link
        className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white/80 px-4 text-sm font-black text-ink transition-colors dark:bg-slate-700 dark:text-white"
        to="/subscriptions"
      >
        <ArrowLeft size={17} />
        {t('payments.back')}
      </Link>

      {isLoading ? <StateMessage title={t('states.loading')} /> : null}
      {error ? <StateMessage title={t('states.error')} message={error} /> : null}

      {!isLoading && !error && subscription ? (
        <>
          <PaymentHeader subscription={subscription} payments={payments} />
          {payments.length === 0 ? (
            <StateMessage title={t('payments.emptyTitle')} message={t('payments.emptyMessage')} />
          ) : (
            <>
              <PaymentFilters
                onChange={setSelectedYear}
                selectedYear={selectedYear}
                years={paymentYears}
              />
              <PaymentTimeline payments={visiblePayments} />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}

function PaymentHeader({ subscription, payments }) {
  const { t } = useTranslation();
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const lastPayment = payments[0];
  const averagePayment = payments.length ? totalPaid / payments.length : 0;

  return (
    <div className="rounded-[2rem] bg-ink p-5 text-white shadow-soft md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ServiceLogo name={subscription.name} />
          <div>
            <p className="text-sm font-bold text-mint">{t('payments.title')}</p>
            <h2 className="text-2xl font-black md:text-3xl">{subscription.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-300">{t('payments.totalPaid')}</p>
          <p className="text-xl font-black text-coral">{formatMoney(totalPaid, subscription.currency)}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label={t('payments.nextRenewal')} value={formatDate(subscription.nextRenewalDate)} />
        <Metric icon={History} label={t('payments.count')} value={payments.length} />
        <Metric icon={History} label={t('payments.average')} value={formatMoney(averagePayment, subscription.currency)} />
        <Metric icon={CalendarDays} label={t('payments.lastPaid')} value={lastPayment ? formatDate(lastPayment.paidAt) : t('payments.none')} />
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function PaymentFilters({ onChange, selectedYear, years }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-4 transition-colors dark:border-slate-600 dark:bg-slate-700/75">
      <label className="block">
        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-300">
          {t('payments.filterYear')}
        </span>
        <select
          className="mt-2 w-full rounded-2xl border border-emerald-100 bg-mist px-4 py-3 font-bold text-ink outline-none transition focus:border-mint focus:bg-white dark:border-slate-600 dark:bg-slate-600 dark:text-white dark:focus:bg-slate-500"
          value={selectedYear}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="all">{t('payments.allYears')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function PaymentTimeline({ payments }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <article
          className="rounded-[2rem] border border-emerald-100 bg-white/80 p-4 transition-colors dark:border-slate-600 dark:bg-slate-700/75"
          key={payment.id}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-black">{formatDate(payment.paidAt)}</p>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">
                {payment.paymentMethod ? getPaymentMethodLabel(payment.paymentMethod) : t('payments.noPaymentMethod')}
              </p>
            </div>
            <p className="font-black text-coral">{formatMoney(payment.amount, payment.currency)}</p>
          </div>
          {payment.notes ? (
            <p className="mt-3 rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-slate-600 dark:bg-slate-600 dark:text-slate-100">
              {payment.notes}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function getPaymentYears(payments) {
  return Array.from(
    new Set(payments.map((payment) => new Date(payment.paidAt).getFullYear())),
  ).sort((left, right) => right - left);
}

function filterPaymentsByYear(payments, selectedYear) {
  if (selectedYear === 'all') return payments;

  return payments.filter(
    (payment) => String(new Date(payment.paidAt).getFullYear()) === selectedYear,
  );
}

function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod.type !== 'card') return paymentMethod.name;
  return `${getCardBrand(paymentMethod)} ${maskCard(paymentMethod.lastFour)}`;
}

function getCardBrand(paymentMethod) {
  return paymentMethod.name
    .replace(/\s+ending\s+\d{4}$/i, '')
    .replace(/\s+\d{4}$/i, '')
    .trim();
}

function maskCard(lastFour) {
  return lastFour ? `**** ${lastFour}` : '****';
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
    year: 'numeric',
  }).format(new Date(value));
}
