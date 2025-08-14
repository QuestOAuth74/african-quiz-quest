import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface QuestionRatingProps {
  questionId: string;
  onRatingChange?: (rating: number) => void;
  showAverage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const QuestionRating = ({ 
  questionId, 
  onRatingChange, 
  showAverage = true,
  size = 'md' 
}: QuestionRatingProps) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  useEffect(() => {
    if (questionId) {
      loadRatingData();
    }
  }, [questionId, user]);

  const loadRatingData = async () => {
    try {
      // Load user's rating if authenticated
      if (user) {
        const { data: userRatingData, error: userError } = await supabase
          .from('question_ratings')
          .select('rating')
          .eq('question_id', questionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userError && userError.code !== 'PGRST116') throw userError;
        setUserRating(userRatingData?.rating || 0);
      }

      // Load question statistics
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('average_rating, total_ratings')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;
      
      setAverageRating(questionData.average_rating || 0);
      setTotalRatings(questionData.total_ratings || 0);
    } catch (error) {
      console.error('Error loading rating data:', error);
    }
  };

  const handleRatingClick = async (rating: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate questions.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('question_ratings')
        .upsert({
          question_id: questionId,
          user_id: user.id,
          rating: rating
        }, {
          onConflict: 'question_id,user_id'
        });

      if (error) throw error;

      setUserRating(rating);
      onRatingChange?.(rating);
      
      // Reload data to get updated averages
      await loadRatingData();

      toast({
        title: "Rating Submitted",
        description: `You rated this question ${rating} star${rating !== 1 ? 's' : ''}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error Submitting Rating",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      const hovered = interactive && i <= hoveredRating;
      
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} transition-colors ${
            interactive ? 'cursor-pointer' : ''
          } ${
            filled || hovered
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={interactive ? () => handleRatingClick(i) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* User Rating Section */}
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rate this question:</span>
          <div className="flex items-center gap-1">
            {renderStars(hoveredRating || userRating, true)}
          </div>
          {userRating > 0 && (
            <span className="text-xs text-muted-foreground">
              Your rating: {userRating}/5
            </span>
          )}
        </div>
      )}

      {/* Average Rating Display */}
      {showAverage && totalRatings > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* No ratings yet */}
      {showAverage && totalRatings === 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(0)}
          </div>
          <span className="text-sm text-muted-foreground">
            No ratings yet
          </span>
        </div>
      )}
    </div>
  );
};

export default QuestionRating;