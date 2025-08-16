import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
  className?: string;
}

export const MessageButton = ({ recipientId, recipientName, className }: MessageButtonProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!user || !message.trim()) return;

    if (user.id === recipientId) {
      toast.error("You can't send a message to yourself");
      return;
    }

    setSending(true);

    try {
      // Get or create thread
      const { data: threadId, error: threadError } = await supabase
        .rpc('get_or_create_thread', { other_user_id: recipientId });

      if (threadError) throw threadError;

      // Send message
      const { error } = await supabase
        .from('private_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content: message.trim()
        });

      if (error) throw error;

      toast.success(`Message sent to ${recipientName}!`);
      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!user || user.id === recipientId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a private message to {recipientName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};