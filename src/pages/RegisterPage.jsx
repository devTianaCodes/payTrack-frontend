import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.trim();

    try {
      await register({
        name: name || undefined,
        email: formData.get('email'),
        password: formData.get('password'),
        locale: 'en',
        defaultCurrency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      actionLabel={t('auth.createAccount')}
      alternateLabel={t('auth.login')}
      alternateTo="/login"
      error={error}
      includeName
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
