import { MessageCircle, Zap, Shield } from 'lucide-react';

export const WelcomeScreen = () => {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-bg">
      <div className="text-center max-w-md px-8 animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-telegram rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to Telegram Web
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            Select a chat to start messaging, or explore your contacts to begin a new conversation.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-telegram-blue/10 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-telegram-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Fast & Reliable</h3>
              <p className="text-sm text-muted-foreground">Instant messaging with real-time delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-telegram-blue/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-telegram-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure</h3>
              <p className="text-sm text-muted-foreground">End-to-end encryption for your privacy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};