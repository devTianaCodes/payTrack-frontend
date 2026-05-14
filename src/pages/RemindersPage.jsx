import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getReminderHistory } from '../api/reminders.js';
import StateMessage from '../components/StateMessage.jsx';

export default function RemindersPage() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    getReminderHistory()
      .then((data) => {
        if (isActive) setReminders(data);
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

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-black md:text-3xl">{t('reminders.title')}</h2>
        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-300">{t('reminders.subtitle')}</p>
      </div>

      {isLoading ? <StateMessage title={t('states.loading')} /> : null}
      {error ? <StateMessage title={t('states.error')} message={error} /> : null}
      {!isLoading && !error && reminders.length === 0 ? (
        <StateMessage title={t('reminders.emptyTitle')} message={t('reminders.emptyMessage')} />
      ) : null}

      {!isLoading && !error && reminders.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ReminderCard({ reminder }) {
  const { t } = useTranslation();

  return (
    <article className="rounded-[2rem] border border-emerald-100 bg-white/80 p-4 transition-colors dark:border-slate-600 dark:bg-slate-700/75">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-mint p-3 text-ink">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="font-black">{reminder.subscription.name}</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">
              {t(`reminders.kind.${reminder.kind}`)}
            </p>
          </div>
        </div>
        <p className="font-black text-coral">
          {formatMoney(reminder.subscription.price, reminder.subscription.currency)}
        </p>
      </div>
      <div className="mt-4 rounded-2xl bg-sage px-4 py-3 text-sm font-bold text-slate-600 dark:bg-slate-600 dark:text-slate-100">
        <p>{t('reminders.sent')} {formatDate(reminder.sentAt)}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
          {t('reminders.renewal')} {formatDate(reminder.renewalDate)}
        </p>
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
