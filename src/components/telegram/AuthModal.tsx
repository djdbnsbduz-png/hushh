import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

interface PhoneFormData {
  phoneNumber: string;
}

interface CodeFormData {
  code: string;
}

export const AuthModal = ({ isOpen, onClose, onAuthenticated }: AuthModalProps) => {
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<PhoneFormData>();
  const codeForm = useForm<CodeFormData>();

  const handlePhoneSubmit = (data: PhoneFormData) => {
    setPhoneNumber(data.phoneNumber);
    setStep('code');
    // Here you would normally send SMS code
    console.log('Sending SMS to:', data.phoneNumber);
  };

  const handleCodeSubmit = (data: CodeFormData) => {
    // Here you would normally verify the code
    console.log('Verifying code:', data.code);
    setStep('success');
    setTimeout(() => {
      onAuthenticated();
      onClose();
      setStep('phone');
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            {step === 'phone' && 'Sign in to Telegram'}
            {step === 'code' && 'Enter verification code'}
            {step === 'success' && 'Welcome!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'phone' && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-telegram rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground">
                  Please enter your phone number to receive a verification code
                </p>
              </div>

              <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-4"
                      {...phoneForm.register('phoneNumber', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                    />
                  </div>
                  {phoneForm.formState.errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {phoneForm.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-telegram-blue hover:bg-telegram-blue-dark text-white"
                  disabled={phoneForm.formState.isSubmitting}
                >
                  Send Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          )}

          {step === 'code' && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-telegram rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <p className="text-muted-foreground">
                  We've sent a verification code to
                </p>
                <p className="font-semibold text-foreground">
                  {phoneNumber}
                </p>
              </div>

              <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    {...codeForm.register('code', { 
                      required: 'Verification code is required',
                      minLength: {
                        value: 6,
                        message: 'Code must be 6 digits'
                      }
                    })}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="text-sm text-red-500 mt-1">
                      {codeForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-telegram-blue hover:bg-telegram-blue-dark text-white"
                  disabled={codeForm.formState.isSubmitting}
                >
                  Verify Code
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setStep('phone')}
                >
                  Back to phone number
                </Button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center animate-bounce-in">
              <div className="w-16 h-16 bg-online rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Authentication Successful!
              </h3>
              <p className="text-muted-foreground">
                Redirecting to your chats...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};