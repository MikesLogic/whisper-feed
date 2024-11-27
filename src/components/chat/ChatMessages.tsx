import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

interface ChatMessagesProps {
  conversationId: string;
  onBack: () => void;
}

export const ChatMessages = ({ conversationId, onBack }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== currentUser?.id) {
            // Get sender's username
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.sender_id)
              .single();

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: currentUser?.id,
                content: payload.new.content,
                type: 'chat',
              });

            // If the user has granted notification permission, show the notification
            if (Notification.permission === 'granted') {
              const { data: settings } = await supabase
                .from('settings')
                .select('push_subscription')
                .eq('user_id', currentUser?.id)
                .single();

              if (settings?.push_subscription) {
                await fetch('/api/push-notification', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    subscription: settings.push_subscription,
                    title: `Message from ${senderProfile?.username || 'Someone'}`,
                    body: payload.new.content,
                    type: 'chat',
                  }),
                });
              }
            }
          }
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data: any) => {
    if (!data.message.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: data.message,
          conversation_id: conversationId,
          sender_id: currentUser.id,
        });

      if (error) throw error;
      reset();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="sm:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender_id === currentUser?.id ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_id === currentUser?.id
                    ? "bg-primary text-white"
                    : "bg-secondary"
                }`}
              >
                <p>{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {format(new Date(message.created_at), "p")}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            {...register("message")}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};