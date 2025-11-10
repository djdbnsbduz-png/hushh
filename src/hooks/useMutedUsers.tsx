import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useMutedUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchMutedUsers = async () => {
      const { data } = await supabase
        .from('muted_users')
        .select('muted_user_id')
        .eq('user_id', user.id);

      if (data) {
        setMutedUserIds(new Set(data.map(m => m.muted_user_id)));
      }
    };

    fetchMutedUsers();
  }, [user]);

  const muteUser = async (mutedUserId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('muted_users')
        .insert({ user_id: user.id, muted_user_id: mutedUserId });

      setMutedUserIds(prev => new Set([...prev, mutedUserId]));
      
      toast({
        title: 'User Muted',
        description: 'You will no longer see messages from this user',
      });
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to mute user',
        variant: 'destructive',
      });
    }
  };

  const unmuteUser = async (mutedUserId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('muted_users')
        .delete()
        .eq('user_id', user.id)
        .eq('muted_user_id', mutedUserId);

      setMutedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mutedUserId);
        return newSet;
      });
      
      toast({
        title: 'User Unmuted',
        description: 'You will now see messages from this user',
      });
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unmute user',
        variant: 'destructive',
      });
    }
  };

  const isUserMuted = (userId: string) => mutedUserIds.has(userId);

  return { mutedUserIds, muteUser, unmuteUser, isUserMuted };
};
