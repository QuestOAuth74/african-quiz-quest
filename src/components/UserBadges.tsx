import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './Badge';

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
}

interface UserBadgesProps {
  userId: string;
  limit?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const UserBadges = ({ 
  userId, 
  limit, 
  size = 'md',
  showTooltip = true 
}: UserBadgesProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        let query = supabase
          .from('user_badges')
          .select(`
            earned_at,
            badges (
              id,
              name,
              description,
              icon,
              color
            )
          `)
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching user badges:', error);
          return;
        }

        const formattedBadges = data?.map((item: any) => ({
          id: item.badges.id,
          name: item.badges.name,
          description: item.badges.description,
          icon: item.badges.icon,
          color: item.badges.color,
          earned_at: item.earned_at
        })) || [];

        setBadges(formattedBadges);
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserBadges();
    }
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="h-6 w-6 bg-muted rounded-full animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          name={badge.name}
          description={badge.description}
          icon={badge.icon}
          color={badge.color}
          size={size}
          showTooltip={showTooltip}
        />
      ))}
    </div>
  );
};