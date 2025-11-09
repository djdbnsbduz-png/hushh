import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

const ACTIVATION_CODE = '3EAk5ku5V/[k&^eo3';

interface ActivationCodePageProps {
  onActivated: () => void;
}

export const ActivationCodePage = ({ onActivated }: ActivationCodePageProps) => {
  const [code, setCode] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === ACTIVATION_CODE) {
      localStorage.setItem('app_activated', 'true');
      onActivated();
      toast({
        title: "Activation Successful",
        description: "Welcome! You can now access the application.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "The activation code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setCode('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-slide-in-right">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Activation Required</CardTitle>
          <CardDescription>
            Please enter the activation code to access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activation-code">Activation Code</Label>
              <Input
                id="activation-code"
                type="text"
                placeholder="Enter activation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="font-mono"
              />
            </div>
            <Button type="submit" className="w-full">
              Activate
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
