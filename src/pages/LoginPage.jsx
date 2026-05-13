import { useTranslation } from 'react-i18next';
import AuthShell from '../components/AuthShell.jsx';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <AuthShell
      title={t('auth.signInTitle')}
      actionLabel={t('auth.login')}
      alternateLabel={t('auth.createAccount')}
      alternateTo="/register"
    />
  );
}
