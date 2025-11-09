import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from './Layout';
import { AuthPage } from '@/components/auth/AuthPage';
import { ActivationCodePage } from '@/components/auth/ActivationCodePage';
import { Spinner } from '@/components/ui/spinner';

export const TelegramApp = () => {
  const { user, loading } = useAuth();
  const [isActivated, setIsActivated] = useState(false);
  const [checkingActivation, setCheckingActivation] = useState(true);

  useEffect(() => {
    const activated = localStorage.getItem('app_activated') === 'true';
    setIsActivated(activated);
    setCheckingActivation(false);
  }, []);

  if (loading || checkingActivation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-telegram-bg">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isActivated) {
    return <ActivationCodePage onActivated={() => setIsActivated(true)} />;
  }

  return (
    <>
      {user ? (
        <Layout />
      ) : (
        <AuthPage />
      )}
    </>
  );
};