import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LookupTools = () => {
  const navigate = useNavigate();
  const [ipInput, setIpInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [results, setResults] = useState<any>(null);

  const handleIpLookup = async () => {
    // Placeholder for IP lookup API integration
    console.log('IP Lookup:', ipInput);
    setResults({ type: 'ip', data: 'API integration needed' });
  };

  const handlePhoneLookup = async () => {
    // Placeholder for phone lookup API integration
    console.log('Phone Lookup:', phoneInput);
    setResults({ type: 'phone', data: 'API integration needed' });
  };

  const handleEmailLookup = async () => {
    // Placeholder for email lookup API integration
    console.log('Email Lookup:', emailInput);
    setResults({ type: 'email', data: 'API integration needed' });
  };

  const handleUsernameLookup = async () => {
    // Placeholder for username lookup API integration
    console.log('Username Lookup:', usernameInput);
    setResults({ type: 'username', data: 'API integration needed' });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Lookup Tools</CardTitle>
            <CardDescription>
              Search for information about IPs, phone numbers, emails, and usernames
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ip" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ip">IP Address</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="username">Username</TabsTrigger>
              </TabsList>

              <TabsContent value="ip" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter IP address (e.g., 8.8.8.8)"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                  />
                  <Button onClick={handleIpLookup}>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </Button>
                </div>
                {results?.type === 'ip' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Results will appear here once API is integrated
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter phone number (e.g., +1234567890)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                  <Button onClick={handlePhoneLookup}>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </Button>
                </div>
                {results?.type === 'phone' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Results will appear here once API is integrated
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <Button onClick={handleEmailLookup}>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </Button>
                </div>
                {results?.type === 'email' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Results will appear here once API is integrated
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="username" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                  />
                  <Button onClick={handleUsernameLookup}>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </Button>
                </div>
                {results?.type === 'username' && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Results will appear here once API is integrated
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
