import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Search } from "lucide-react";
import { NewConversationDialog } from "./NewConversationDialog";

interface ConversationListProps {
  conversations: any[];
  currentUserId?: string;
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
}

export const ConversationList = ({
  conversations,
  currentUserId,
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) => {
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant =
      conv.participant1_id === currentUserId
        ? conv.participant2.username
        : conv.participant1.username;
    return otherParticipant.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredConversations.map((conv) => {
            const otherParticipant =
              conv.participant1_id === currentUserId
                ? conv.participant2
                : conv.participant1;

            return (
              <Button
                key={conv.id}
                variant={selectedConversationId === conv.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectConversation(conv.id)}
              >
                {otherParticipant.username}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        currentUserId={currentUserId}
      />
    </div>
  );
};