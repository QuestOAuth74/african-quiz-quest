-- Create admin action logs table for spam protection
CREATE TABLE public.admin_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  request_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin action logs
CREATE POLICY "Only admins can view admin action logs" 
ON public.admin_action_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can create admin action logs" 
ON public.admin_action_logs 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_admin_action_logs_user_id_created_at ON public.admin_action_logs (user_id, created_at DESC);
CREATE INDEX idx_admin_action_logs_action_type_created_at ON public.admin_action_logs (action_type, created_at DESC);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_request_payload JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  -- Only allow admins to log actions
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  INSERT INTO public.admin_action_logs (
    user_id,
    action_type,
    resource_type,
    resource_id,
    request_payload
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_request_payload
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  p_action_type TEXT,
  p_time_window_minutes INTEGER DEFAULT 5,
  p_max_actions INTEGER DEFAULT 50
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  action_count INTEGER;
BEGIN
  -- Only allow admins to check rate limits
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Count actions in the time window
  SELECT COUNT(*) INTO action_count
  FROM public.admin_action_logs
  WHERE user_id = auth.uid()
    AND action_type = p_action_type
    AND created_at > now() - (p_time_window_minutes || ' minutes')::interval;
  
  -- Return true if under limit, false if over limit
  RETURN action_count < p_max_actions;
END;
$function$;

-- Create function to get recent admin activity
CREATE OR REPLACE FUNCTION public.get_recent_admin_activity(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  display_name TEXT,
  action_type TEXT,
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to view activity
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    aal.id,
    aal.user_id,
    p.display_name,
    aal.action_type,
    aal.resource_type,
    aal.resource_id,
    aal.created_at
  FROM public.admin_action_logs aal
  LEFT JOIN public.profiles p ON aal.user_id = p.user_id
  ORDER BY aal.created_at DESC
  LIMIT p_limit;
END;
$function$;