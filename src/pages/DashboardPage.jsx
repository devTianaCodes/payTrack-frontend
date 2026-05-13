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
  monthlySpend: 55.96,
  yearlyProjection: 671.52,
  activeSubscriptionCount: 5,
  upcomingRenewals: [
    { id: 'demo-netflix', name: 'Netflix', price: 15.99, currency: 'USD', nextRenewalDate: '2026-05-18T00:00:00.000Z' },
    { id: 'demo-figma', name: 'Figma', price: 12, currency: 'USD', nextRenewalDate: '2026-05-21T00:00:00.000Z' },
    { id: 'demo-icloud', name: 'iCloud', price: 2.99, currency: 'USD', nextRenewalDate: '2026-05-25T00:00:00.000Z' },
    { id: 'demo-spotify', name: 'Spotify', price: 10.99, currency: 'USD', nextRenewalDate: '2026-06-02T00:00:00.000Z' },
    { id: 'demo-waking-up', name: 'Waking Up', price: 14.99, currency: 'USD', nextRenewalDate: '2026-06-05T00:00:00.000Z' },
  ],
  categoryMix: [
    { name: 'Entertainment', value: 26.98, color: '#FF6B5F' },
    { name: 'Education', value: 14.99, color: '#F59E0B' },
    { name: 'Productivity', value: 12, color: '#2EE59D' },
    { name: 'Utilities', value: 2.99, color: '#101828' },
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
        <div className="rounded-[2rem] bg-ink p-5 text-white md:p-6">
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
        <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 md:p-6">
          <h2 className="text-lg font-black">{t('dashboard.renewals')}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {upcomingRenewals.map((subscription) => (
              <Renewal key={subscription.id} subscription={subscription} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white/80 p-5 md:p-6">
          <h2 className="text-lg font-black">{t('dashboard.spendingMix')}</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" innerRadius={54} outerRadius={78} paddingAngle={4}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
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
    <div className="flex items-center justify-between rounded-2xl bg-sage p-4 text-ink">
      <div className="flex items-center gap-3">
        <ServiceLogo name={subscription.name} />
        <div>
          <p className="font-black">{subscription.name}</p>
          <p className="text-sm font-bold text-slate-500">{formatDate(subscription.nextRenewalDate)}</p>
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
