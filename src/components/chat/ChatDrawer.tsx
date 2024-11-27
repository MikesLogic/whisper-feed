import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { ChatMessages } from "./ChatMessages";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer = ({ isOpen, onClose }: ChatDrawerProps) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(username),
          participant2:profiles!conversations_participant2_id_fkey(username)
        `)
        .or(`participant1_id.eq.${currentUser.id},participant2_id.eq.${currentUser.id}`);

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full p-0 sm:w-[400px] md:w-[500px] lg:w-[600px]"
      >
        <div className="flex h-full">
          <div 
            className={`w-full transition-all duration-300 ${
              selectedConversation ? 'hidden sm:block sm:w-2/5' : 'w-full'
            } border-r`}
          >
            <ConversationList
              conversations={conversations || []}
              currentUserId={currentUser?.id}
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation}
            />
          </div>
          {selectedConversation && (
            <div className="w-full sm:w-3/5">
              <ChatMessages
                conversationId={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};