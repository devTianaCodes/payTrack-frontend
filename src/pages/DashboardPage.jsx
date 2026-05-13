import { Plus, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import ServiceLogo from '../components/ServiceLogo.jsx';

const categoryData = [
  { name: 'Entertainment', value: 42, color: '#2EE59D' },
  { name: 'Productivity', value: 28, color: '#FF6B5F' },
  { name: 'Utilities', value: 30, color: '#101828' },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] bg-ink p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-mint">{t('dashboard.monthlySpend')}</p>
            <p className="mt-2 text-4xl font-black">$186.40</p>
          </div>
          <div className="rounded-full bg-white/10 p-3">
            <TrendingUp />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric label={t('dashboard.yearlyProjection')} value="$2,236" />
          <Metric label={t('dashboard.renewals')} value="3" />
        </div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-4 font-black text-ink"
      >
        <Plus size={20} />
        {t('actions.addSubscription')}
      </button>

      <div className="rounded-[2rem] border border-slate-100 p-5">
        <h2 className="text-lg font-black">{t('dashboard.renewals')}</h2>
        <div className="mt-4 space-y-3">
          <Renewal name="Netflix" date="May 18" amount="$15.99" />
          <Renewal name="Figma" date="May 21" amount="$12.00" />
          <Renewal name="iCloud" date="May 25" amount="$2.99" />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-100 p-5">
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

function Renewal({ name, date, amount }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-ink">
      <div className="flex items-center gap-3">
        <ServiceLogo name={name} />
        <div>
          <p className="font-black">{name}</p>
          <p className="text-sm font-bold text-slate-500">{date}</p>
        </div>
      </div>
      <p className="font-black text-coral">{amount}</p>
    </div>
  );
}
