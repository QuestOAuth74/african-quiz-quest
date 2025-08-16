import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAdminRateLimit } from '@/hooks/useAdminRateLimit';
import { useToast } from '@/hooks/use-toast';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface ProtectedAdminActionProps {
  actionType: string;
  resourceType: string;
  resourceId?: string;
  payload?: any;
  onExecute: () => Promise<void>;
  children: ReactNode;
  requireConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  className?: string;
}

export const ProtectedAdminAction = ({
  actionType,
  resourceType,
  resourceId,
  payload,
  onExecute,
  children,
  requireConfirmation = false,
  confirmationTitle,
  confirmationDescription,
  variant = 'default',
  disabled = false,
  className
}: ProtectedAdminActionProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { isLimited, loading, executeWithRateLimit, config, remainingActions, resetTime } = useAdminRateLimit(actionType);
  const { toast } = useToast();

  const handleExecute = async () => {
    if (isLimited) {
      const resetTimeFormatted = resetTime ? new Date(resetTime).toLocaleTimeString() : 'soon';
      toast({
        title: "Rate limit exceeded",
        description: `Too many ${actionType} actions. Try again after ${resetTimeFormatted}`,
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      await executeWithRateLimit(
        onExecute,
        resourceType,
        resourceId,
        payload
      );
      
      toast({
        title: "Action completed",
        description: `${actionType} completed successfully`,
      });
    } catch (error: any) {
      console.error(`${actionType} failed:`, error);
      toast({
        title: "Action failed",
        description: error.message || `Failed to execute ${actionType}`,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const isDisabled = disabled || loading || isExecuting || isLimited;

  const ActionButton = (
    <Button
      variant={variant}
      disabled={isDisabled}
      className={className}
      onClick={requireConfirmation ? undefined : handleExecute}
    >
      {isExecuting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />}
      {children}
    </Button>
  );

  // Show rate limit status
  const RateLimitIndicator = () => {
    if (isLimited && resetTime) {
      const timeUntilReset = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000 / 60));
      return (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <Clock className="h-3 w-3" />
          Rate limited - Reset in {timeUntilReset}m
        </div>
      );
    }
    
    if (remainingActions < 5 && remainingActions > 0) {
      return (
        <div className="flex items-center gap-2 text-xs text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          {remainingActions} actions remaining
        </div>
      );
    }
    
    return null;
  };

  if (!requireConfirmation) {
    return (
      <div className="space-y-1">
        {ActionButton}
        <RateLimitIndicator />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {ActionButton}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {confirmationTitle || 'Confirm Admin Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDescription || `Are you sure you want to execute this ${actionType} action?`}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Action Details:</div>
                <div className="space-y-1 text-xs">
                  <div className="flex gap-2">
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline">{actionType}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Resource:</span>
                    <span>{resourceType}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Rate Limit:</span>
                    <span>{config.maxActions} actions per {config.timeWindowMinutes} minutes</span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecute}
              disabled={isDisabled}
              className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isExecuting ? 'Executing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <RateLimitIndicator />
    </div>
  );
};