import { useState, useEffect, useRef } from 'react';

interface LoginPageProps {
  onAuthenticated: () => void;
}

export const LoginPage = ({ onAuthenticated }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [accessKeyAttempts, setAccessKeyAttempts] = useState(0);
  const [usernameError, setUsernameError] = useState('');
  const [accessKeyError, setAccessKeyError] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const entranceSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Auto-play background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(() => {
        // Handle autoplay restrictions
      });
    }
  }, []);

  const handleStartInitiation = () => {
    if (isBanned) {
      setShowBan(true);
      setTimeout(() => setShowBan(false), 3000);
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedAccessKey = accessKey.trim();

    // Reset errors
    setUsernameError('');
    setAccessKeyError('');
    setTwoFactorError('');

    if (trimmedUsername === 'user' && trimmedAccessKey === '1234') {
      // Play entrance sound
      if (entranceSoundRef.current) {
        entranceSoundRef.current.play().catch(() => {});
      }

      // Fade out and show 2FA
      setFadeOut(true);
      setTimeout(() => {
        setShowTwoFactor(true);
      }, 500);
    } else {
      let newAttempts = accessKeyAttempts;
      
      if (trimmedUsername !== 'user') {
        setUsernameError('Incorrect username');
      }
      
      if (trimmedAccessKey !== '1234') {
        setAccessKeyError('Incorrect access key');
        newAttempts += 1;
        setAccessKeyAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsBanned(true);
          setShowBan(true);
          
          // Unban after 10 minutes
          setTimeout(() => {
            setIsBanned(false);
            setAccessKeyAttempts(0);
          }, 600000);
          
          setTimeout(() => setShowBan(false), 3000);
        }
      }
    }
  };

  const handleVerifyCode = () => {
    const trimmedCode = twoFactorCode.trim();
    
    if (trimmedCode === '5678') {
      setShowWelcome(true);
      setTimeout(() => {
        onAuthenticated();
      }, 2000);
    } else {
      setTwoFactorError('Are you trying to guess the 2FA code?');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
      {/* Background Music */}
      <audio 
        ref={backgroundMusicRef} 
        autoPlay 
        loop 
        className="hidden"
      >
        <source 
          src="https://docs.google.com/uc?export=download&id=1WwL812sE3VmJeN7aMBK1w1r8Z_alSwKT" 
          type="audio/mpeg" 
        />
      </audio>

      {/* Entrance Sound */}
      <audio ref={entranceSoundRef} className="hidden">
        <source 
          src="https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg" 
          type="audio/ogg" 
        />
      </audio>

      <div className="text-center max-w-md w-full px-4">
        {!showTwoFactor && !showWelcome && (
          <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-3xl font-bold mb-8 text-telegram-blue">Login Page</h1>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border-2 transition-colors ${
                    usernameError ? 'border-red-500' : 'border-transparent focus:border-telegram-blue'
                  } focus:outline-none`}
                />
                {usernameError && (
                  <div className="text-red-500 text-sm mt-1">{usernameError}</div>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Access Key"
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border-2 transition-colors ${
                    accessKeyError ? 'border-red-500' : 'border-transparent focus:border-telegram-blue'
                  } focus:outline-none`}
                />
                {accessKeyError && (
                  <div className="text-red-500 text-sm mt-1">{accessKeyError}</div>
                )}
              </div>

              <button
                onClick={handleStartInitiation}
                className="w-full mt-6 py-3 px-8 text-lg bg-gray-800 text-white rounded-lg hover:shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                Start Initiation
              </button>
            </div>
          </div>
        )}

        {showTwoFactor && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-telegram-blue">Two-Factor Authentication</h2>
            
            {twoFactorError && (
              <div className="text-red-500 text-lg mb-4">{twoFactorError}</div>
            )}
            
            <div className="space-y-4">
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="2FA Code"
                className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 border-transparent focus:border-telegram-blue focus:outline-none"
              />
              
              <button
                onClick={handleVerifyCode}
                className="w-full py-3 px-8 text-lg bg-gray-800 text-white rounded-lg hover:shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer"
              >
                Verify Code
              </button>
            </div>
          </div>
        )}

        {showWelcome && (
          <div className="animate-fade-in bg-black/80 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-online mb-2">Login successful!</h2>
            <p className="text-gray-300">Welcome. Redirecting to your chats...</p>
          </div>
        )}

        {showBan && (
          <div className="animate-fade-in bg-red-900/20 border border-red-500 p-4 rounded-lg mt-4">
            <p className="text-red-400 font-semibold">
              You are banned for 10 minutes due to too many incorrect attempts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};