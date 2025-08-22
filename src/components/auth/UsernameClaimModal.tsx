import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UsernameClaimModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const UsernameClaimModal = ({ isOpen, onSuccess }: UsernameClaimModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleClaimUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Check if username is available by searching for existing profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();

      if (existingUser) {
        toast({
          title: "Username Taken",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive",
        });
        return;
      }

      // Create account with temporary email and the chosen password
      const tempEmail = `${username.toLowerCase()}@temp.local`;
      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: username,
          },
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Sign in immediately after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password,
        });

        if (signInError) {
          toast({
            title: "Error",
            description: "Account created but sign in failed. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success!",
          description: `Welcome, ${username}! Your account has been created.`,
        });
        
        onSuccess();
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

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Your Username</DialogTitle>
          <DialogDescription>
            Choose a unique username and password for your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleClaimUsername} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your desired username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim Username
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};