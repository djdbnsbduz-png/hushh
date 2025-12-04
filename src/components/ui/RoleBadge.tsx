import { AppRole } from '@/hooks/useRole';

interface RoleBadgeProps {
  role: AppRole;
  size?: 'sm' | 'md';
}

export const RoleBadge = ({ role, size = 'sm' }: RoleBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  
  const getRoleClasses = () => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'moderator':
        return 'bg-blue-600 text-white';
      case 'rich':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-[0_0_12px_rgba(251,191,36,0.7)] animate-[glow_2s_ease-in-out_infinite]';
      case 'pretty':
        return 'bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold shadow-[0_0_12px_rgba(244,114,182,0.7)] animate-[glow_2s_ease-in-out_infinite]';
      case 'user':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLabel = () => {
    switch (role) {
      case 'rich':
        return 'Rich';
      case 'pretty':
        return 'Pretty';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${getRoleClasses()}`}>
      {getLabel()}
    </span>
  );
};