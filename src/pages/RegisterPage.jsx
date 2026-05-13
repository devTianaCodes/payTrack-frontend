import { useTranslation } from 'react-i18next';
import AuthShell from '../components/AuthShell.jsx';

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      actionLabel={t('auth.createAccount')}
      alternateLabel={t('auth.login')}
      alternateTo="/login"
    />
  );
}
