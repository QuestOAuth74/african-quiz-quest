-- Create private messaging tables

-- Create message threads table to track conversations between users
CREATE TABLE public.message_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Ensure unique thread between two users (regardless of order)
  CONSTRAINT unique_participants UNIQUE (
    LEAST(participant_1_id, participant_2_id), 
    GREATEST(participant_1_id, participant_2_id)
  )
);

-- Create private messages table
CREATE TABLE public.private_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_threads
-- Users can only see threads they participate in
CREATE POLICY "Users can view their own threads" 
ON public.message_threads 
FOR SELECT 
TO authenticated
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Users can create threads with other users
CREATE POLICY "Users can create message threads" 
ON public.message_threads 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Users can update threads they participate in (for last_message_at)
CREATE POLICY "Users can update their own threads" 
ON public.message_threads 
FOR UPDATE 
TO authenticated
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- RLS Policies for private_messages
-- Users can only see messages in threads they participate in
CREATE POLICY "Users can view messages in their threads" 
ON public.private_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads 
    WHERE id = private_messages.thread_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

-- Users can send messages in threads they participate in
CREATE POLICY "Users can send messages in their threads" 
ON public.private_messages 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.message_threads 
    WHERE id = private_messages.thread_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

-- Users can update their own messages (for read status)
CREATE POLICY "Users can update messages in their threads" 
ON public.private_messages 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads 
    WHERE id = private_messages.thread_id 
    AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
  )
);

-- Create indexes for better performance
CREATE INDEX idx_message_threads_participants ON public.message_threads(participant_1_id, participant_2_id);
CREATE INDEX idx_message_threads_updated_at ON public.message_threads(updated_at DESC);
CREATE INDEX idx_private_messages_thread_id ON public.private_messages(thread_id);
CREATE INDEX idx_private_messages_created_at ON public.private_messages(created_at);
CREATE INDEX idx_private_messages_sender_id ON public.private_messages(sender_id);

-- Create function to update thread's last_message_at when new message is sent
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.message_threads 
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update thread timestamp
CREATE TRIGGER update_thread_on_new_message
  AFTER INSERT ON public.private_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_last_message();

-- Create function to get or create a thread between two users
CREATE OR REPLACE FUNCTION public.get_or_create_thread(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  thread_id uuid;
BEGIN
  -- Check if thread already exists
  SELECT id INTO thread_id
  FROM public.message_threads
  WHERE 
    (participant_1_id = current_user_id AND participant_2_id = other_user_id) OR
    (participant_1_id = other_user_id AND participant_2_id = current_user_id);
  
  -- If thread doesn't exist, create it
  IF thread_id IS NULL THEN
    INSERT INTO public.message_threads (participant_1_id, participant_2_id)
    VALUES (
      LEAST(current_user_id, other_user_id),
      GREATEST(current_user_id, other_user_id)
    )
    RETURNING id INTO thread_id;
  END IF;
  
  RETURN thread_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_or_create_thread(uuid) TO authenticated;