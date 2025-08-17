import { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Search, Settings, Phone, Video, MoreVertical, Paperclip, Smile, Send, MessageCircle, Zap, Shield, ArrowLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// Types
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping?: boolean;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  isRead: boolean;
}

interface LoginPageProps {
  onAuthenticated: () => void;
}

// Login Page Component
const LoginPage = ({ onAuthenticated }: LoginPageProps) => {
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
  
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const entranceSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(() => {
        console.log('Background music autoplay blocked by browser');
      });
    }
  }, []);

  const handleStartInitiation = () => {
    if (isBanned) {
      setShowBan(true);
      return;
    }

    const isUsernameValid = username.trim() === 'user';
    const isAccessKeyValid = accessKey.trim() === '1234';

    setUsernameError('');
    setAccessKeyError('');

    if (isUsernameValid && isAccessKeyValid) {
      if (entranceSoundRef.current) {
        entranceSoundRef.current.play().catch(() => {
          console.log('Entrance sound play blocked by browser');
        });
      }

      setTimeout(() => {
        setShowTwoFactor(true);
      }, 500);
    } else {
      if (!isUsernameValid) {
        setUsernameError('Incorrect username');
      }
      if (!isAccessKeyValid) {
        setAccessKeyError('Incorrect access key');
        const newAttempts = accessKeyAttempts + 1;
        setAccessKeyAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsBanned(true);
          setShowBan(true);
          setTimeout(() => {
            setIsBanned(false);
            setShowBan(false);
            setAccessKeyAttempts(0);
          }, 600000); // 10 minutes
        }
      }
    }
  };

  const handleVerifyCode = () => {
    if (twoFactorCode.trim() === '5678') {
      setShowTwoFactor(false);
      setShowWelcome(true);
      setTimeout(() => {
        onAuthenticated();
      }, 2000);
    } else {
      setTwoFactorError('Are you trying to guess the 2FA code?');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <audio ref={backgroundMusicRef} autoPlay loop>
        <source src="https://docs.google.com/uc?export=download&id=1WwL812sE3VmJeN7aMBK1w1r8Z_alSwKT" type="audio/mpeg" />
      </audio>
      <audio ref={entranceSoundRef}>
        <source src="https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg" type="audio/ogg" />
      </audio>

      <div className="w-full max-w-md space-y-6 text-center">
        {!showTwoFactor && !showWelcome && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={cn("text-center", usernameError && "border-red-500")}
              />
              {usernameError && (
                <p className="text-red-500 text-sm">{usernameError}</p>
              )}

              <Input
                type="password"
                placeholder="Access Key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className={cn("text-center", accessKeyError && "border-red-500")}
              />
              {accessKeyError && (
                <p className="text-red-500 text-sm">{accessKeyError}</p>
              )}
            </div>

            <Button 
              onClick={handleStartInitiation}
              className="w-full bg-muted hover:bg-muted/80 text-foreground hover:shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] transition-all duration-300"
              size="lg"
            >
              Start Initiation
            </Button>
          </div>
        )}

        {showTwoFactor && (
          <div className="space-y-6 animate-fade-in">
            {twoFactorError && (
              <p className="text-red-500 text-lg font-semibold">{twoFactorError}</p>
            )}
            <Input
              type="text"
              placeholder="2FA Code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="text-center"
            />
            <Button 
              onClick={handleVerifyCode}
              className="w-full"
              size="lg"
            >
              Verify Code
            </Button>
          </div>
        )}

        {showWelcome && (
          <div className="animate-fade-in bg-muted/50 p-6 rounded-lg">
            <p className="text-lg font-semibold text-foreground">
              Login successful! Welcome.
            </p>
          </div>
        )}

        {showBan && (
          <div className="animate-fade-in bg-red-500/10 border border-red-500 p-6 rounded-lg">
            <p className="text-red-500 font-semibold">
              You are banned for 10 minutes due to too many incorrect attempts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <div className={cn(
      "flex w-full message-appear",
      message.isSent ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] px-4 py-2 rounded-2xl shadow-chat",
        message.isSent 
          ? "bg-message-sent text-message-sent-foreground rounded-br-md" 
          : "bg-message-received text-message-received-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed break-words">
          {message.content}
        </p>
        
        <div className={cn(
          "flex items-center justify-end gap-1 mt-1",
          message.isSent ? "text-message-sent-foreground/70" : "text-message-received-foreground/70"
        )}>
          <span className="text-xs">
            {message.timestamp}
          </span>
          
          {message.isSent && (
            <div className="flex items-center">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-read" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Contact List Component
const ContactList = ({ 
  contacts, 
  selectedContact, 
  onSelectContact 
}: {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-sidebar-hover",
              selectedContact?.id === contact.id && "bg-sidebar-selected"
            )}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-telegram flex items-center justify-center text-white font-semibold shadow-md">
                {contact.avatar || getInitials(contact.name)}
              </div>
              {contact.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground truncate">
                  {contact.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {formatTime(contact.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className={cn(
                  "text-sm truncate",
                  contact.isTyping 
                    ? "text-telegram-blue italic" 
                    : "text-muted-foreground"
                )}>
                  {contact.isTyping ? "typing..." : contact.lastMessage}
                </p>
                
                {contact.unreadCount > 0 && (
                  <div className="bg-telegram-blue text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ml-2">
                    {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// Sidebar Component
const Sidebar = ({ 
  contacts, 
  selectedContact, 
  onSelectContact 
}: {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="font-semibold text-lg text-foreground">Telegram</h1>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chats..."
            className="pl-10 bg-sidebar-search border-0"
          />
        </div>
      </div>
      
      <ContactList
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={onSelectContact}
      />
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-telegram flex items-center justify-center text-white font-semibold">
            Y
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">You</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat View Component
const ChatView = ({ 
  contact, 
  messages 
}: {
  contact: Contact;
  messages: Message[];
}) => {
  const [messageText, setMessageText] = useState('');
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-chat">
      <div className="flex items-center justify-between p-4 border-b border-border bg-chat-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-telegram flex items-center justify-center text-white font-semibold">
              {contact.avatar || getInitials(contact.name)}
            </div>
            {contact.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div>
            <h2 className="font-semibold text-foreground">{contact.name}</h2>
            <p className="text-sm text-muted-foreground">
              {contact.isTyping ? 'typing...' : contact.isOnline ? 'online' : 'last seen recently'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border bg-chat-input">
        <div className="flex items-end gap-3">
          <Button variant="ghost" size="icon" className="mb-1">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none border-0 bg-chat-message-input"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="mb-1">
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleSendMessage}
            size="icon"
            className="mb-1 bg-telegram-blue hover:bg-telegram-blue/90 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Welcome Screen Component
const WelcomeScreen = () => {
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

// Layout Component
const Layout = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: '',
      lastMessage: 'Hey! How are you doing today?',
      timestamp: '2024-01-15T10:30:00Z',
      unreadCount: 3,
      isOnline: true,
      isTyping: false
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: '',
      lastMessage: 'Can we schedule a meeting for tomorrow?',
      timestamp: '2024-01-15T09:15:00Z',
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    },
    {
      id: '3',
      name: 'Carol Davis',
      avatar: '',
      lastMessage: 'Thanks for the help earlier!',
      timestamp: '2024-01-14T16:45:00Z',
      unreadCount: 1,
      isOnline: true,
      isTyping: true
    },
    {
      id: '4',
      name: 'David Wilson',
      avatar: '',
      lastMessage: 'See you at the conference next week',
      timestamp: '2024-01-14T14:20:00Z',
      unreadCount: 0,
      isOnline: false,
      isTyping: false
    },
    {
      id: '5',
      name: 'Eva Brown',
      avatar: '',
      lastMessage: 'The project is coming along nicely 🎉',
      timestamp: '2024-01-13T11:30:00Z',
      unreadCount: 2,
      isOnline: true,
      isTyping: false
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Hey! How are you doing today?',
      timestamp: '10:30',
      isSent: false,
      isRead: true
    },
    {
      id: '2',
      content: 'Hi Alice! I\'m doing great, thanks for asking. How about you?',
      timestamp: '10:32',
      isSent: true,
      isRead: true
    },
    {
      id: '3',
      content: 'I\'m good too! Just working on some new projects. Are you free for a call later?',
      timestamp: '10:35',
      isSent: false,
      isRead: true
    },
    {
      id: '4',
      content: 'Sure! I should be free around 3 PM. Does that work for you?',
      timestamp: '10:37',
      isSent: true,
      isRead: false
    }
  ];

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
          <Sidebar
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={65}>
          {selectedContact ? (
            <ChatView contact={selectedContact} messages={messages} />
          ) : (
            <WelcomeScreen />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

// Main Telegram App Component
export const TelegramAppComplete = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('telegram_auth');
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = () => {
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