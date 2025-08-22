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
      const { error } = await supabase.auth.signInWithPassword({
        email,
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

  const handleClaimSuccess = () => {
    setShowClaimModal(false);
    // Auth state will be handled by the AuthProvider
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-telegram-bg p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-telegram-blue">隱私</CardTitle>
            <CardDescription>
              {!showClaimModal 
                ? "Enter the authentication code to access the app."
                : "Welcome! Please sign in with your existing account."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showClaimModal ? (
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
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email/Username</Label>
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
            )}
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