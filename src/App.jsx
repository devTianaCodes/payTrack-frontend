import { Bell, CreditCard, Home, Settings } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: Home, labelKey: 'navigation.dashboard' },
  { to: '/subscriptions', icon: CreditCard, labelKey: 'navigation.subscriptions' },
  { to: '/reminders', icon: Bell, labelKey: 'navigation.reminders' },
  { to: '/settings', icon: Settings, labelKey: 'navigation.settings' },
];

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sage text-ink transition-colors dark:bg-slate-600 dark:text-slate-100">
      <a className="skip-link" href="#main-content">
        {t('actions.skipToContent')}
      </a>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl bg-mist shadow-soft transition-colors dark:bg-slate-500 lg:my-6 lg:min-h-[calc(100vh-3rem)] lg:overflow-hidden lg:rounded-[2rem]">
        <aside className="hidden w-72 flex-col border-r border-emerald-100 bg-white/85 px-5 py-6 transition-colors dark:border-slate-600 dark:bg-slate-700/80 md:flex">
          <div>
            <p className="text-sm font-semibold text-mint">{t('app.tagline')}</p>
            <h1 className="text-3xl font-black tracking-tight text-ink dark:text-white">{t('app.name')}</h1>
          </div>

          <nav className="mt-8 space-y-2" aria-label={t('navigation.primary')}>
            {navItems.map((item) => (
              <SidebarNavItem key={item.to} item={item} label={t(item.labelKey)} />
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
          <header className="sticky top-0 z-10 border-b border-emerald-100 bg-mist/95 px-5 py-4 backdrop-blur transition-colors dark:border-slate-600 dark:bg-slate-500/95 md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-mint">{t('app.tagline')}</p>
                <h1 className="text-2xl font-black tracking-tight text-ink dark:text-white">{t('app.name')}</h1>
              </div>
              <button
                type="button"
                className="rounded-full bg-ink p-3 text-white shadow-soft"
                aria-label={t('actions.notifications')}
                onClick={() => navigate('/reminders')}
              >
                <Bell size={20} />
              </button>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-5 py-5 md:px-8 md:py-8 lg:overflow-y-auto" tabIndex={-1}>
            <Outlet />
          </main>

          <nav
            className="sticky bottom-0 border-t border-emerald-100 bg-mist/95 px-4 py-3 backdrop-blur transition-colors dark:border-slate-600 dark:bg-slate-500/95 md:hidden"
            aria-label={t('navigation.mobile')}
          >
            <div className="grid grid-cols-4 gap-2">
              {navItems.map((item) => (
                <NavItem key={item.to} item={item} label={t(item.labelKey)} />
              ))}
            </div>
          </nav>
        </div>
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
          isActive ? 'bg-mint text-ink' : 'text-slate-500 dark:text-slate-200',
        ].join(' ')
      }
    >
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarNavItem({ item, label }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition',
          isActive ? 'bg-mint text-ink' : 'text-slate-500 hover:bg-sage hover:text-ink dark:text-slate-200 dark:hover:bg-slate-600 dark:hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
}
