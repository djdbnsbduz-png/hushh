import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { AppRole } from '@/hooks/useRole';
import { Calendar, User } from 'lucide-react';

interface UserProfile {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  banner_url?: string;
  name_font?: string;
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
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-card-border">
        {/* Banner */}
        <div className="relative h-32 w-full bg-gradient-to-br from-primary/30 to-secondary">
          {profile.banner_url && (
            <img
              src={profile.banner_url}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
          {/* Avatar overlay */}
          <div className="absolute -bottom-12 left-6">
            <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile.display_name?.charAt(0) || profile.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 px-6 pb-6 space-y-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className={`text-xl flex items-center gap-2 flex-wrap ${fontClass}`}>
              {profile.display_name || profile.username}
              {roles.map((role) => (
                <RoleBadge key={role} role={role} size="md" />
              ))}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">@{profile.username}</p>
          </DialogHeader>

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-foreground">Bio</h4>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};