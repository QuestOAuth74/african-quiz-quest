import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MessageThread {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    email: string;
    display_name: string;
  };
  unread_count?: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

interface PrivateMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    email: string;
    display_name: string;
  };
}

interface ForumUser {
  user_id: string;
  display_name: string;
  email: string;
}

export const PrivateMessages = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState<ForumUser[]>([]);
  const [newThreadMessage, setNewThreadMessage] = useState('');

  // Load message threads
  const loadThreads = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all threads for current user
      const { data: threadsData, error } = await supabase
        .from('message_threads')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get other user details and unread counts for each thread
      const threadsWithDetails = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const otherUserId = thread.participant_1_id === user.id 
            ? thread.participant_2_id 
            : thread.participant_1_id;

          // Get other user details from profiles
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, display_name, email')
            .eq('user_id', otherUserId)
            .single();

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from('private_messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('private_messages')
            .select('content, sender_id')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...thread,
            other_user: profileData ? {
              id: profileData.user_id,
              email: profileData.email,
              display_name: profileData.display_name || profileData.email.split('@')[0]
            } : {
              id: otherUserId,
              email: 'Unknown User',
              display_name: 'Unknown User'
            },
            unread_count: unreadCount || 0,
            last_message: lastMessage
          };
        })
      );

      setThreads(threadsWithDetails);
    } catch (error) {
      console.error('Error loading threads:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific thread
  const loadMessages = async (threadId: string) => {
    if (!user) return;

    try {
      setLoadingMessages(true);
      
      // Get messages with sender information
      const { data: messagesData, error } = await supabase
        .from('private_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender details for each message
      const messagesWithSender = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('user_id, display_name, email')
            .eq('user_id', msg.sender_id)
            .single();

          return {
            ...msg,
            sender: senderData ? {
              id: senderData.user_id,
              display_name: senderData.display_name || senderData.email.split('@')[0],
              email: senderData.email
            } : undefined
          };
        })
      );

      setMessages(messagesWithSender);

      // Mark messages as read
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', user.id);

    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const sendMessage = async (threadId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Reload messages and threads
      await loadMessages(threadId);
      await loadThreads();
      
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Search for users to start new conversation
  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .neq('user_id', user.id)
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Start new conversation
  const startNewConversation = async (otherUserId: string) => {
    if (!user || !newThreadMessage.trim()) return;

    try {
      // Get or create thread
      const { data: threadId, error: threadError } = await supabase
        .rpc('get_or_create_thread', { other_user_id: otherUserId });

      if (threadError) throw threadError;

      // Send first message
      const { error } = await supabase
        .from('private_messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          content: newThreadMessage.trim()
        });

      if (error) throw error;

      // Reset form and close dialog
      setNewThreadMessage('');
      setSearchUser('');
      setSearchResults([]);
      setIsComposeOpen(false);
      
      // Reload threads and select the new one
      await loadThreads();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchUser) {
        searchUsers(searchUser);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Threads List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </CardTitle>
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>
                    Search for a user to start messaging
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                          onClick={() => {
                            setSearchUser(user.display_name || user.email);
                            setSearchResults([]);
                          }}
                        >
                          <div>
                            <p className="font-medium">{user.display_name || user.email.split('@')[0]}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Textarea
                    placeholder="Type your message..."
                    value={newThreadMessage}
                    onChange={(e) => setNewThreadMessage(e.target.value)}
                    rows={3}
                  />
                  
                  <Button 
                    onClick={() => {
                      const selectedUser = searchResults.find(u => 
                        u.display_name === searchUser || u.email === searchUser
                      );
                      if (selectedUser) {
                        startNewConversation(selectedUser.user_id);
                      }
                    }}
                    disabled={!searchUser || !newThreadMessage.trim()}
                    className="w-full"
                  >
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {threads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No conversations yet
              </p>
            ) : (
              threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {thread.other_user?.display_name}
                        </p>
                        {thread.unread_count && thread.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {thread.unread_count}
                          </Badge>
                        )}
                      </div>
                      {thread.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.last_message.sender_id === user?.id ? 'You: ' : ''}
                          {thread.last_message.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="lg:col-span-2">
        {selectedThread ? (
          <>
            <CardHeader>
              <CardTitle>
                {selectedThread.other_user?.display_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {/* Messages */}
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Send Message */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(selectedThread.id, newMessage);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendMessage(selectedThread.id, newMessage)}
                  disabled={!newMessage.trim()}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};