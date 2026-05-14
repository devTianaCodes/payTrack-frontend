import { Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { getDashboard } from '../api/dashboard.js';
import ServiceLogo from '../components/ServiceLogo.jsx';
import StateMessage from '../components/StateMessage.jsx';

const demoDashboard = {
  currency: 'USD',
  monthlySpend: 95.96,
  yearlyProjection: 1151.52,
  activeSubscriptionCount: 7,
  upcomingRenewals: [
    { id: 'demo-netflix', name: 'Netflix', price: 15.99, currency: 'USD', nextRenewalDate: '2026-05-18T00:00:00.000Z' },
    { id: 'demo-figma', name: 'Figma', price: 12, currency: 'USD', nextRenewalDate: '2026-05-21T00:00:00.000Z' },
    { id: 'demo-icloud', name: 'iCloud', price: 2.99, currency: 'USD', nextRenewalDate: '2026-05-25T00:00:00.000Z' },
    { id: 'demo-spotify', name: 'Spotify', price: 10.99, currency: 'USD', nextRenewalDate: '2026-06-02T00:00:00.000Z' },
    { id: 'demo-waking-up', name: 'Waking Up', price: 14.99, currency: 'USD', nextRenewalDate: '2026-06-05T00:00:00.000Z' },
    { id: 'demo-codex', name: 'Codex', price: 20, currency: 'USD', nextRenewalDate: '2026-06-12T00:00:00.000Z' },
    { id: 'demo-claude', name: 'Claude', price: 20, currency: 'USD', nextRenewalDate: '2026-06-14T00:00:00.000Z' },
  ],
  categoryMix: [
    {
      name: 'Entertainment',
      value: 26.98,
      color: '#FF6B5F',
      subscriptions: [
        { id: 'demo-netflix', name: 'Netflix', value: 15.99 },
        { id: 'demo-spotify', name: 'Spotify', value: 10.99 },
      ],
    },
    {
      name: 'Education',
      value: 14.99,
      color: '#F59E0B',
      subscriptions: [{ id: 'demo-waking-up', name: 'Waking Up', value: 14.99 }],
    },
    {
      name: 'Productivity',
      value: 12,
      color: '#2EE59D',
      subscriptions: [{ id: 'demo-figma', name: 'Figma', value: 12 }],
    },
    {
      name: 'Programming',
      value: 40,
      color: '#38BDF8',
      subscriptions: [
        { id: 'demo-codex', name: 'Codex', value: 20 },
        { id: 'demo-claude', name: 'Claude', value: 20 },
      ],
    },
    {
      name: 'Utilities',
      value: 2.99,
      color: '#101828',
      subscriptions: [{ id: 'demo-icloud', name: 'iCloud', value: 2.99 }],
    },
  ],
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    getDashboard()
      .then((data) => {
        if (isActive) setDashboard(data);
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

  const summary = dashboard?.activeSubscriptionCount > 0 ? dashboard : demoDashboard;
  const categoryData = summary.categoryMix.length > 0 ? summary.categoryMix : demoDashboard.categoryMix;
  const upcomingRenewals =
    summary.upcomingRenewals.length > 0 ? summary.upcomingRenewals : demoDashboard.upcomingRenewals;

  return (
    <section className="space-y-5 lg:space-y-6">
      {isLoading ? <StateMessage title={t('states.loading')} /> : null}
      {error ? <StateMessage title={t('states.error')} message={error} /> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
        <div className="rounded-[2rem] bg-ink p-5 text-white shadow-soft dark:bg-slate-800 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-mint">{t('dashboard.monthlySpend')}</p>
              <p className="mt-2 text-4xl font-black">
                {formatMoney(summary.monthlySpend, summary.currency)}
              </p>
            </div>
            <div className="rounded-full bg-white/10 p-3">
              <TrendingUp />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label={t('dashboard.yearlyProjection')} value={formatMoney(summary.yearlyProjection, summary.currency)} />
            <Metric label={t('dashboard.activeSubscriptions')} value={summary.activeSubscriptionCount} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/subscriptions?action=add')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-4 font-black text-ink lg:min-h-full lg:flex-col lg:text-lg"
        >
          <Plus size={20} className="lg:size-8" />
          {t('actions.addSubscription')}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 transition-colors dark:border-slate-600 dark:bg-slate-700/75 md:p-6">
          <h2 className="text-lg font-black">{t('dashboard.renewals')}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {upcomingRenewals.map((subscription) => (
              <Renewal key={subscription.id} subscription={subscription} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 transition-colors dark:border-slate-600 dark:bg-slate-700/75 md:p-6">
          <h2 className="text-lg font-black">{t('dashboard.spendingMix')}</h2>
          <SpendingMixChart categories={categoryData} currency={summary.currency} />
        </div>
      </div>
    </section>
  );
}

function SpendingMixChart({ categories, currency }) {
  const total = categories.reduce((sum, category) => sum + Number(category.value), 0);

  return (
    <div className="mt-4 space-y-4">
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categories} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={4}>
              {categories.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-black uppercase text-slate-500 dark:text-slate-300">Total</p>
            <p className="text-lg font-black">{formatMoney(total, currency)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.name} className="rounded-2xl bg-sage p-3 transition-colors dark:bg-slate-600">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <p className="font-black">{category.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-coral">{formatMoney(category.value, currency)}</p>
                <p className="text-xs font-black text-slate-500 dark:text-slate-300">
                  {formatPercent(category.value, total)}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {(category.subscriptions ?? []).map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between gap-3 text-sm font-bold text-slate-500 dark:text-slate-300"
                >
                  <span>{subscription.name}</span>
                  <span className="text-right">
                    {formatMoney(subscription.value, currency)}
                    <span className="ml-2 text-xs text-slate-400">
                      {formatPercent(subscription.value, total)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs font-bold text-white/70">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function Renewal({ subscription }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-sage p-4 text-ink transition-colors dark:bg-slate-600 dark:text-white">
      <div className="flex items-center gap-3">
        <ServiceLogo name={subscription.name} />
        <div>
          <p className="font-black">{subscription.name}</p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{formatDate(subscription.nextRenewalDate)}</p>
        </div>
      </div>
      <p className="font-black text-coral">{formatMoney(subscription.price, subscription.currency)}</p>
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

function formatPercent(value, total) {
  if (!total) return '0%';
  return `${Math.round((Number(value) / total) * 100)}%`;
}
