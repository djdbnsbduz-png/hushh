import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useProfile } from '@/hooks/useProfile';
import { usePhoneNumber } from '@/hooks/usePhoneNumber';
import { useAuth } from '@/hooks/useAuth';
import { useCustomization } from '@/hooks/useCustomization';
import { Camera, LogOut, User, Palette, Type, Image as ImageIcon, Settings2, RotateCcw, Smile, Layout } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { phoneNumber, updatePhoneNumber } = usePhoneNumber();
  const { signOut } = useAuth();
  const { settings, updateCustomization, resetToDefaults } = useCustomization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  // Update form fields when profile data changes or modal opens
  useEffect(() => {
    if (open && profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [open, profile]);

  // Update phone field when phone data changes
  useEffect(() => {
    if (open) {
      setPhone(phoneNumber || '');
    }
  }, [open, phoneNumber]);

  const handleSaveProfile = async () => {
    const profileSuccess = await updateProfile({
      display_name: displayName,
      username,
      bio,
    });
    
    const phoneSuccess = await updatePhoneNumber(phone || null);
    
    // Close modal on successful save
    if (profileSuccess !== false && phoneSuccess !== false) {
      onOpenChange(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll use a placeholder URL. In a real app, you'd upload to storage
      const url = URL.createObjectURL(file);
      await updateCustomization({
        background_type: 'image',
        background_value: url,
      });
    }
  };

  const handleResetCustomization = async () => {
    await resetToDefaults();
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  const bubbleStyleOptions = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const sidebarWidthOptions = [
    { value: 'narrow', label: 'Narrow' },
    { value: 'normal', label: 'Normal' },
    { value: 'wide', label: 'Wide' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings & Customization
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="emojis">
              <Smile className="h-4 w-4 mr-2" />
              Emojis
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings2 className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {profile?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to change your profile picture
              </p>
            </div>

            <Separator />

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Enter your unique username"
                />
                <p className="text-xs text-muted-foreground">
                  Username must be unique and can only contain letters, numbers, and underscores
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Save Profile Changes
            </Button>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme Settings</CardTitle>
                <CardDescription>Customize the overall appearance of your app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Mode</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      updateCustomization({ theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={settings.accent_color}
                      onChange={(e) => updateCustomization({ accent_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.accent_color}
                      onChange={(e) => updateCustomization({ accent_color: e.target.value })}
                      placeholder="#6B7280"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message Bubble Style</Label>
                  <Select 
                    value={settings.message_bubble_style} 
                    onValueChange={(value: 'rounded' | 'square' | 'minimal') => 
                      updateCustomization({ message_bubble_style: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bubbleStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sidebar Width</Label>
                  <Select 
                    value={settings.sidebar_width} 
                    onValueChange={(value: 'narrow' | 'normal' | 'wide') => 
                      updateCustomization({ sidebar_width: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sidebarWidthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Background Settings</CardTitle>
                <CardDescription>Customize your app background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Background Type</Label>
                  <Select 
                    value={settings.background_type} 
                    onValueChange={(value: 'default' | 'gradient' | 'image' | 'color') => 
                      updateCustomization({ background_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="color">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.background_type === 'color' && (
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={settings.background_value || '#000000'}
                      onChange={(e) => updateCustomization({ background_value: e.target.value })}
                      className="w-full h-10"
                    />
                  </div>
                )}

                {settings.background_type === 'gradient' && (
                  <div className="space-y-2">
                    <Label>Gradient CSS</Label>
                    <Input
                      value={settings.background_value || ''}
                      onChange={(e) => updateCustomization({ background_value: e.target.value })}
                      placeholder="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
                    />
                  </div>
                )}

                {settings.background_type === 'image' && (
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => backgroundFileRef.current?.click()}
                        className="flex-1"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <input
                        ref={backgroundFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                    </div>
                    <Input
                      value={settings.background_value || ''}
                      onChange={(e) => updateCustomization({ background_value: e.target.value })}
                      placeholder="Or enter image URL"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Page Layout</CardTitle>
                <CardDescription>Customize the overall page layout and spacing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select 
                    value={settings.border_radius} 
                    onValueChange={(value: 'none' | 'small' | 'medium' | 'large') => 
                      updateCustomization({ border_radius: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Sharp Corners)</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large (Very Rounded)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Card Shadows</Label>
                  <Select 
                    value={settings.card_shadow} 
                    onValueChange={(value: 'none' | 'small' | 'medium' | 'large') => 
                      updateCustomization({ card_shadow: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Shadow (Flat)</SelectItem>
                      <SelectItem value="small">Subtle</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Spacing</Label>
                  <Select 
                    value={settings.spacing} 
                    onValueChange={(value: 'compact' | 'normal' | 'spacious') => 
                      updateCustomization({ spacing: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact (Dense)</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="spacious">Spacious (Airy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <Select 
                    value={settings.animation_speed} 
                    onValueChange={(value: 'none' | 'fast' | 'normal' | 'slow') => 
                      updateCustomization({ animation_speed: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Animations</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="slow">Slow (Smooth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Hover Effects</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable subtle scale animations on hover
                    </p>
                  </div>
                  <Switch
                    checked={settings.hover_effects}
                    onCheckedChange={(checked) => 
                      updateCustomization({ hover_effects: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Font Settings</CardTitle>
                <CardDescription>Customize text appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select 
                    value={settings.font_family} 
                    onValueChange={(value) => updateCustomization({ font_family: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span style={{ fontFamily: option.value }}>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select 
                    value={settings.font_size} 
                    onValueChange={(value: 'small' | 'medium' | 'large') => 
                      updateCustomization({ font_size: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Font Family</Label>
                  <Input
                    placeholder="Enter custom font name (e.g., 'Times New Roman')"
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        updateCustomization({ font_family: e.target.value.trim() });
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Make sure the font is installed on your system or loaded via CSS
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emojis Tab */}
          <TabsContent value="emojis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emoji Picker</CardTitle>
                <CardDescription>Browse and copy Apple-style emojis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      navigator.clipboard.writeText(emojiData.emoji);
                    }}
                    emojiStyle={EmojiStyle.APPLE}
                    theme={settings.theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    width="100%"
                    height="400px"
                    searchPlaceHolder="Search emojis..."
                    previewConfig={{
                      showPreview: true,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Click any emoji to copy it to your clipboard
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom CSS</CardTitle>
                <CardDescription>Add your own CSS to fully customize the appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Custom CSS Code</Label>
                  <Textarea
                    value={settings.custom_css || ''}
                    onChange={(e) => updateCustomization({ custom_css: e.target.value })}
                    placeholder="/* Enter your custom CSS here */
body { background: linear-gradient(45deg, #ff6b6b, #4ecdc4); }
.message-bubble { border-radius: 20px; }"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use CSS to override any styles. Changes apply immediately.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reset Options</CardTitle>
                <CardDescription>Reset customizations to default values</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleResetCustomization}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset All Customizations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Sign Out Button */}
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </DialogContent>
    </Dialog>
  );
};