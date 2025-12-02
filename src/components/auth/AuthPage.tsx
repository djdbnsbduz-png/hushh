import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { signUpSchema, emailSchema, passwordSchema } from '@/lib/validation';

export const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify' | '2fa'>('signin');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('[Sign In] Starting sign in process...');

    try {
      let loginEmail = email;
      
      // If the input doesn't contain @, assume it's a username and look up the email
      if (!email.includes('@')) {
        // For username login, we need to find the email associated with the username
        const { data: profiles, error: lookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', email.toLowerCase())
          .single();
        
        if (lookupError || !profiles) {
          toast({
            title: "User Not Found",
            description: "No account found with that username.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Convert username to email format for auth
        loginEmail = `${email.toLowerCase()}@app.local`;
      }

      console.log('[Sign In] Attempting password verification...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        console.error('[Sign In] Password verification failed:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('[Sign In] Password verified, signing out...');
        // Sign out immediately after password verification
        await supabase.auth.signOut();
        
        console.log('[Sign In] Sending OTP...');
        // Send OTP using Supabase's built-in email service
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: loginEmail,
          options: {
            shouldCreateUser: false,
          },
        });

        if (otpError) {
          console.error('[Sign In] OTP error:', otpError);
          toast({
            title: "Error",
            description: "Failed to send verification code. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Store pending login info and switch to 2FA mode
        console.log('[Sign In] Switching to 2FA mode...');
        setPendingEmail(loginEmail);
        setPendingUserId(data.user.id);
        setAuthMode('2fa');
        console.log('[Sign In] Auth mode set to 2FA');
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the 6-digit verification code.",
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify OTP using Supabase's built-in verification
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: twoFactorCode.trim(),
        type: 'email',
      });

      if (error) {
        console.error('OTP verification error:', error);
        toast({
          title: "Invalid Code",
          description: "The code is incorrect or has expired. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Success!",
          description: "You have been signed in successfully.",
        });

        // Reset form
        setEmail('');
        setPassword('');
        setTwoFactorCode('');
        setPendingEmail('');
        setPendingUserId('');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all inputs using Zod schema
    const validationResult = signUpSchema.safeParse({
      email: email.trim(),
      password,
      confirmPassword,
      username: username.trim(),
      displayName: displayName.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const validatedData = validationResult.data;
    setIsLoading(true);

    try {
      // Check username availability (already lowercased by validation)
      const { data: isAvailable, error: availabilityError } = await supabase.rpc(
        'check_username_availability',
        { check_username: validatedData.username }
      );

      if (availabilityError) {
        toast({
          title: "Error",
          description: "Failed to check username availability",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!isAvailable) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign up user with validated data
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: validatedData.displayName || validatedData.username,
            username: validatedData.username,
            phone: validatedData.phone || null,
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

      if (data.user && !data.session) {
        // Email confirmation required
        setPendingEmail(email);
        setAuthMode('verify');
        toast({
          title: "Verify Your Email",
          description: "Please check your email and enter the verification code.",
        });
      } else if (data.session) {
        // Auto-signed in (email confirmation disabled)
        toast({
          title: "Account Created!",
          description: "Your account has been created successfully!",
        });
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Email Verified!",
          description: "Your account has been verified successfully.",
        });
        // Reset form and go back to sign in
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setUsername('');
        setPhone('');
        setVerificationCode('');
        setPendingEmail('');
        setAuthMode('signin');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAuthModeSelector = () => (
    <div className="flex space-x-1 mb-6 p-1 bg-muted rounded-lg">
      <Button
        type="button"
        variant={authMode === 'signin' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => setAuthMode('signin')}
        disabled={authMode === 'verify'}
      >
        Sign In
      </Button>
      <Button
        type="button"
        variant={authMode === 'signup' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => setAuthMode('signup')}
        disabled={authMode === 'verify'}
      >
        Sign Up
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
        <Label htmlFor="signup-email">Email *</Label>
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

  const renderVerifyForm = () => (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          We sent a verification code to <span className="font-medium">{pendingEmail}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="verification-code">Verification Code</Label>
        <Input
          id="verification-code"
          type="text"
          placeholder="Enter the 6-digit code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
          maxLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify Email
      </Button>
      <Button 
        type="button" 
        variant="ghost" 
        className="w-full" 
        onClick={resendVerificationCode}
        disabled={isLoading}
      >
        Resend Code
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => setAuthMode('signup')}
        disabled={isLoading}
      >
        Back to Sign Up
      </Button>
    </form>
  );

  const render2FAForm = () => (
    <form onSubmit={handleVerify2FA} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          A 6-digit verification code has been sent to <span className="font-medium">{pendingEmail}</span>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="2fa-code">Verification Code</Label>
        <Input
          id="2fa-code"
          type="text"
          placeholder="Enter the 6-digit code"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
          required
          maxLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify & Sign In
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => {
          setAuthMode('signin');
          setTwoFactorCode('');
          setPendingEmail('');
          setPendingUserId('');
        }}
        disabled={isLoading}
      >
        Back to Sign In
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-telegram-blue">隱私</CardTitle>
          <CardDescription>
            {authMode === 'signin' && 'Sign in to your existing account'}
            {authMode === 'signup' && 'Create a new account to get started'}
            {authMode === 'verify' && 'Verify your email address'}
            {authMode === '2fa' && 'Two-Factor Authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authMode !== 'verify' && authMode !== '2fa' && renderAuthModeSelector()}
          
          {authMode === 'signin' && renderSignInForm()}
          {authMode === 'signup' && renderSignUpForm()}
          {authMode === 'verify' && renderVerifyForm()}
          {authMode === '2fa' && render2FAForm()}
        </CardContent>
      </Card>
    </div>
  );
};