import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { LoginPage } from './LoginPage';

export const TelegramApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage, etc.)
    const authToken = localStorage.getItem('telegram_auth');
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
    // In a real app, you'd store the auth token
    localStorage.setItem('telegram_auth', 'authenticated');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('telegram_auth');
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <Layout />
      ) : (
        <LoginPage onAuthenticated={handleAuthenticated} />
      )}
    </>
  );
};