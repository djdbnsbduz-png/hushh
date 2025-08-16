import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { AuthModal } from './AuthModal';

export const TelegramApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage, etc.)
    const authToken = localStorage.getItem('telegram_auth');
    if (authToken) {
      setIsAuthenticated(true);
    } else {
      // Show auth modal after a brief delay for better UX
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAuthenticated = () => {
    // In a real app, you'd store the auth token
    localStorage.setItem('telegram_auth', 'authenticated');
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('telegram_auth');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  if (!isAuthenticated && !showAuthModal) {
    return (
      <div className="h-screen bg-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-blue"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Layout />
      ) : (
        <div className="h-screen bg-gradient-bg" />
      )}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
};