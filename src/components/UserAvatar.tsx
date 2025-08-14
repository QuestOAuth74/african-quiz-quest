import { cn } from '@/lib/utils';
import { getDisplayName } from '@/lib/username-generator';

interface UserAvatarProps {
  displayName?: string | null;
  email?: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar = ({ displayName, email, userId, size = 'md', className }: UserAvatarProps) => {
  // Generate a consistent color based on display name or email
  const generateColor = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const getInitials = (name: string) => {
    if (name && name.trim()) {
      return name
        .trim()
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    return '?';
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const finalDisplayName = getDisplayName(displayName, userId, email);
  const backgroundColor = generateColor(finalDisplayName);
  const initials = getInitials(finalDisplayName);

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
};