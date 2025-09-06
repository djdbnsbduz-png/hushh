import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  customization?: {
    theme: 'light' | 'dark' | 'auto';
    font_family: string;
    font_size: 'small' | 'medium' | 'large';
    background_type: 'default' | 'gradient' | 'image' | 'color';
    background_value: string | null;
    accent_color: string;
    message_bubble_style: 'rounded' | 'square' | 'minimal';
    sidebar_width: 'narrow' | 'normal' | 'wide';
    custom_css: string | null;
  };
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        // Handle the JSONB customization field properly
        const profileData = {
          ...data,
          customization: data.customization ? (typeof data.customization === 'string' ? JSON.parse(data.customization) : data.customization) : undefined
        } as Profile;
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      // Check if username is being updated and if it's already taken
      if (updates.username && updates.username !== profile?.username) {
        const { data: isAvailable, error: availabilityError } = await supabase.rpc(
          'check_username_availability',
          { check_username: updates.username.toLowerCase() }
        );

        if (availabilityError) {
          toast({
            title: "Error",
            description: "Failed to check username availability",
            variant: "destructive",
          });
          return false;
        }

        if (!isAvailable) {
          toast({
            title: "Username Taken",
            description: "This username is already taken. Please choose another one.",
            variant: "destructive",
          });
          return false;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        if (error.code === '23505' && error.message.includes('profiles_username_unique')) {
          toast({
            title: "Username Taken",
            description: "This username is already taken. Please choose another one.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update profile",
            variant: "destructive",
          });
        }
        return false;
      } else {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return false;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: data.publicUrl });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
};