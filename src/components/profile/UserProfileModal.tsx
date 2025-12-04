import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { AppRole } from '@/hooks/useRole';
import { Calendar } from 'lucide-react';

interface UserProfile {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  banner_url?: string;
  name_font?: string;
  profile_accent_color?: string;
  created_at: string;
}

interface UserProfileModalProps {
  profile: UserProfile | null;
  roles: AppRole[];
  isOpen: boolean;
  onClose: () => void;
}

const NAME_FONTS: Record<string, string> = {
  default: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  cursive: 'font-[cursive]',
  fantasy: 'font-[fantasy]',
  roboto: 'font-[Roboto]',
  montserrat: 'font-[Montserrat]',
  poppins: 'font-[Poppins]',
};

export const UserProfileModal = ({ profile, roles, isOpen, onClose }: UserProfileModalProps) => {
  if (!profile) return null;

  const fontClass = NAME_FONTS[profile.name_font || 'default'] || NAME_FONTS.default;
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-[hsl(var(--card))] border-none rounded-lg">
        {/* Banner */}
        <div 
          className="relative h-24 w-full"
          style={{
            background: profile.banner_url 
              ? undefined 
              : `linear-gradient(135deg, ${profile.profile_accent_color || '#6366f1'} 0%, ${profile.profile_accent_color || '#6366f1'}80 50%, ${profile.profile_accent_color || '#6366f1'}40 100%)`
          }}
        >
          {profile.banner_url && (
            <img
              src={profile.banner_url}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar - overlapping banner */}
        <div className="relative px-4">
          <div className="absolute -top-12 left-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-[6px] border-[hsl(var(--card))] shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.display_name?.charAt(0) || profile.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-[3px] border-[hsl(var(--card))]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-10 px-4 pb-4 bg-[hsl(var(--popover))] rounded-b-lg">
          {/* Name and username */}
          <div className="space-y-0.5 mb-3">
            <div className={`text-xl font-semibold text-foreground flex items-center gap-2 flex-wrap ${fontClass}`}>
              {profile.display_name || profile.username}
              {roles.map((role) => (
                <RoleBadge key={role} role={role} size="sm" />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">{profile.username}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-3" />

          {/* Bio */}
          {profile.bio && (
            <div className="mb-3">
              <h4 className="text-xs font-bold uppercase text-foreground mb-1">About Me</h4>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Member Since */}
          <div>
            <h4 className="text-xs font-bold uppercase text-foreground mb-1">Member Since</h4>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{joinDate}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};