import { Bell, CreditCard, Home, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: Home, labelKey: 'navigation.dashboard' },
  { to: '/subscriptions', icon: CreditCard, labelKey: 'navigation.subscriptions' },
  { to: '/settings', icon: Settings, labelKey: 'navigation.settings' },
];

export default function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-soft">
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-mint">{t('app.tagline')}</p>
              <h1 className="text-2xl font-black tracking-tight">{t('app.name')}</h1>
            </div>
            <button
              type="button"
              className="rounded-full bg-ink p-3 text-white shadow-soft"
              aria-label={t('actions.notifications')}
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-5">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 border-t border-slate-100 bg-white px-4 py-3">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} label={t(item.labelKey)} />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ item, label }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-bold transition',
          isActive ? 'bg-mint text-ink' : 'text-slate-500',
        ].join(' ')
      }
    >
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  );
}
