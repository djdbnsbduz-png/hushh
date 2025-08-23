import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UsernameClaimModal } from './UsernameClaimModal';

export const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [authMode, setAuthMode] = useState<'code' | 'signin' | 'signup'>('signin');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const { toast } = useToast();

  const VALID_AUTH_CODE = '3!aB9$xQ2#jL7^tH6@fR1&zN8*eW4%qY0!mP5^kJ3#vT9&hZ1@cX7!sR2^lF8$qM6#bV3%aT5!jH0&gY9^nP4@wZ2*eK8#xL1';

  const handleAuthCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authCode === VALID_AUTH_CODE) {
        toast({
          title: "Code Verified!",
          description: "Now claim your username to create your account.",
        });
        setShowClaimModal(true);
      } else {
        toast({
          title: "Invalid Code",
          description: "The authentication code you entered is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let loginEmail = email;
      
      // If the input doesn't contain @, assume it's a username and convert to email format
      if (!email.includes('@')) {
        loginEmail = `${email.toLowerCase()}@example.com`;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check username availability
      const { data: isAvailable, error: availabilityError } = await supabase.rpc(
        'check_username_availability',
        { check_username: username.toLowerCase() }
      );

      if (availabilityError) {
        toast({
          title: "Error",
          description: "Failed to check username availability",
          variant: "destructive",
        });
        return;
      }

      if (!isAvailable) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName || username,
            username: username.toLowerCase(),
            phone: phone || null,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setUsername('');
        setPhone('');
        setAuthMode('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    // Auth state will be handled by the AuthProvider
  };

  const renderAuthModeSelector = () => (
    <div className="flex space-x-1 mb-6 p-1 bg-muted rounded-lg">
      <Button
        type="button"
        variant={authMode === 'signin' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => setAuthMode('signin')}
      >
        Sign In
      </Button>
      <Button
        type="button"
        variant={authMode === 'signup' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => setAuthMode('signup')}
      >
        Sign Up
      </Button>
      <Button
        type="button"
        variant={authMode === 'code' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => setAuthMode('code')}
      >
        Code
      </Button>
    </div>
  );

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email or Username</Label>
        <Input
          id="signin-email"
          type="text"
          placeholder="Enter your email or username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );

  const renderSignUpForm = () => (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-displayname">Display Name</Label>
        <Input
          id="signup-displayname"
          type="text"
          placeholder="Your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-username">Username *</Label>
        <Input
          id="signup-username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-phone">Phone Number (optional)</Label>
        <Input
          id="signup-phone"
          type="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
        <Input
          id="signup-confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );

  const renderAuthCodeForm = () => (
    <form onSubmit={handleAuthCode} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="auth-code">Authentication Code</Label>
        <Input
          id="auth-code"
          type="password"
          placeholder="Enter authentication code"
          value={authCode}
          onChange={(e) => setAuthCode(e.target.value)}
          required
          className="font-mono"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify Code
      </Button>
    </form>
  );

  const getFormTitle = () => {
    if (authMode === 'signin') return 'Welcome Back';
    if (authMode === 'signup') return 'Create Account';
    return 'Enter Code';
  };

  const getFormDescription = () => {
    if (authMode === 'signin') return 'Sign in to your existing account';
    if (authMode === 'signup') return 'Create a new account to get started';
    return 'Enter the authentication code to access the app';
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-telegram-blue">隱私</CardTitle>
            <CardDescription>
              {getFormDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderAuthModeSelector()}
            
            {authMode === 'signin' && renderSignInForm()}
            {authMode === 'signup' && renderSignUpForm()}
            {authMode === 'code' && renderAuthCodeForm()}
          </CardContent>
        </Card>
      </div>
      
      <UsernameClaimModal 
        isOpen={showClaimModal} 
        onSuccess={handleClaimSuccess}
      />
    </>
  );
};