import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from './useRole';

interface UserRoleCache {
  [userId: string]: AppRole[];
}

export const useUserRoles = (userIds: string[]) => {
  const [userRoles, setUserRoles] = useState<UserRoleCache>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchRoles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (error) {
          console.error('Error fetching user roles:', error);
          return;
        }

        const rolesMap: UserRoleCache = {};
        data?.forEach((item) => {
          if (!rolesMap[item.user_id]) {
            rolesMap[item.user_id] = [];
          }
          rolesMap[item.user_id].push(item.role as AppRole);
        });

        setUserRoles(rolesMap);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [userIds.join(',')]);

  const getUserRoles = (userId: string): AppRole[] => {
    return userRoles[userId] || [];
  };

  const hasRole = (userId: string, role: AppRole): boolean => {
    return getUserRoles(userId).includes(role);
  };

  return { userRoles, getUserRoles, hasRole, loading };
};
