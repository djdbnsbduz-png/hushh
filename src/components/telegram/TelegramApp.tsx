import { useAuth } from '@/hooks/useAuth';
import { Layout } from './Layout';
import { AuthPage } from '@/components/auth/AuthPage';
import { Spinner } from '@/components/ui/spinner';

export const TelegramApp = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-telegram-bg">
        <Spinner className="h-8 w-8" />
      </div>
    );
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