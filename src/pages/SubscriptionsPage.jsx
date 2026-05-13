import { Filter, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const subscriptions = [
  { name: 'Netflix', category: 'Entertainment', amount: '$15.99', renewal: 'May 18' },
  { name: 'Spotify', category: 'Entertainment', amount: '$10.99', renewal: 'Jun 02' },
  { name: 'Gym', category: 'Fitness', amount: '$45.00', renewal: 'Jun 10' },
];

export default function SubscriptionsPage() {
  const { t } = useTranslation();

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

      <div className="space-y-3">
        {subscriptions.map((subscription) => (
          <article key={subscription.name} className="rounded-[2rem] border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black">{subscription.name}</h3>
                <p className="text-sm font-bold text-slate-500">{subscription.category}</p>
              </div>
              <p className="font-black text-ink">{subscription.amount}</p>
            </div>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
              Renews {subscription.renewal}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
