import { Filter, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSubscriptions } from '../api/subscriptions.js';
import ServiceLogo from '../components/ServiceLogo.jsx';
import StateMessage from '../components/StateMessage.jsx';

const demoSubscriptions = [
  {
    id: 'demo-netflix',
    name: 'Netflix',
    category: { name: 'Entertainment' },
    price: 15.99,
    currency: 'USD',
    nextRenewalDate: '2026-05-18T00:00:00.000Z',
  },
  {
    id: 'demo-spotify',
    name: 'Spotify',
    category: { name: 'Entertainment' },
    price: 10.99,
    currency: 'USD',
    nextRenewalDate: '2026-06-02T00:00:00.000Z',
  },
  {
    id: 'demo-gym',
    name: 'Gym',
    category: { name: 'Fitness' },
    price: 45,
    currency: 'USD',
    nextRenewalDate: '2026-06-10T00:00:00.000Z',
  },
];

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    getSubscriptions()
      .then((data) => {
        if (isActive) setSubscriptions(data);
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

  const rows = subscriptions.length > 0 ? subscriptions : demoSubscriptions;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{t('subscriptions.title')}</h2>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-slate-200 p-3" aria-label="Filter">
            <Filter size={19} />
          </button>
          <button type="button" className="rounded-full bg-coral p-3 text-white" aria-label="Add">
            <Plus size={19} />
          </button>
        </div>
      </div>

      {isLoading ? <StateMessage title={t('states.loading')} /> : null}
      {error ? <StateMessage title={t('states.error')} message={error} /> : null}
      {!isLoading && !error && subscriptions.length === 0 ? (
        <StateMessage title={t('subscriptions.emptyTitle')} message={t('subscriptions.emptyMessage')} />
      ) : null}

      {!isLoading && !error ? (
        <div className="space-y-3">
          {rows.map((subscription) => (
            <SubscriptionCard key={subscription.id} subscription={subscription} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SubscriptionCard({ subscription }) {
  return (
    <article className="rounded-[2rem] border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ServiceLogo name={subscription.name} />
          <div>
            <h3 className="font-black">{subscription.name}</h3>
            <p className="text-sm font-bold text-slate-500">{subscription.category?.name ?? 'Uncategorized'}</p>
          </div>
        </div>
        <p className="font-black text-ink">{formatMoney(subscription.price, subscription.currency)}</p>
      </div>
      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
        Renews {formatDate(subscription.nextRenewalDate)}
      </p>
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
