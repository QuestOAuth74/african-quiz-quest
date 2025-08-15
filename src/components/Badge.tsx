import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const colorVariants = {
  green: 'bg-green-600 text-white border-green-500',
  blue: 'bg-blue-600 text-white border-blue-500',
  purple: 'bg-purple-600 text-white border-purple-500',
  gold: 'bg-yellow-500 text-primary-foreground border-yellow-400',
  yellow: 'bg-yellow-500 text-primary-foreground border-yellow-400',
  orange: 'bg-orange-600 text-white border-orange-500',
  rainbow: 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white border-purple-300'
};

const sizeVariants = {
  sm: 'h-5 w-5 text-xs',
  md: 'h-6 w-6 text-sm',
  lg: 'h-8 w-8 text-base'
};

export const Badge = ({ 
  name, 
  description, 
  icon, 
  color, 
  size = 'md',
  showTooltip = true 
}: BadgeProps) => {
  const IconComponent = (Icons as any)[icon] as LucideIcon;
  
  if (!IconComponent) {
    return null;
  }

  const badgeClasses = cn(
    'inline-flex items-center justify-center rounded-full border',
    'transition-all duration-200 hover:scale-110',
    colorVariants[color as keyof typeof colorVariants] || colorVariants.blue,
    sizeVariants[size]
  );

  return (
    <div 
      className={badgeClasses}
      title={showTooltip ? `${name}: ${description}` : undefined}
    >
      <IconComponent className="h-3 w-3" />
    </div>
  );
};