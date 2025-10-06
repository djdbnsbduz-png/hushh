import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface PhoneNumber {
  id: string;
  user_id: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const usePhoneNumber = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPhoneNumber();
    } else {
      setPhoneNumber(null);
      setLoading(false);
    }
  }, [user]);

  const fetchPhoneNumber = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_phone_numbers')
        .select('phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching phone number:', error);
      } else {
        setPhoneNumber(data?.phone || null);
      }
    } catch (error) {
      console.error('Error fetching phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePhoneNumber = async (phone: string | null) => {
    if (!user) return false;

    try {
      // Check if phone number record exists
      const { data: existing } = await supabase
        .from('user_phone_numbers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_phone_numbers')
          .update({ phone })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_phone_numbers')
          .insert({ user_id: user.id, phone });

        if (error) throw error;
      }

      setPhoneNumber(phone);
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    phoneNumber,
    loading,
    updatePhoneNumber,
    refetch: fetchPhoneNumber,
  };
};
