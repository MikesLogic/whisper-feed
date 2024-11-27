import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  currentUserId,
}: NewConversationDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || !currentUserId) return [];

      const { data: blockedUsers } = await supabase
        .from('blocked_users')
        .select('blocked_id, blocker_id')
        .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

      const blockedIds = blockedUsers?.map(b => 
        b.blocker_id === currentUserId ? b.blocked_id : b.blocker_id
      ) || [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .neq('id', currentUserId)
        .not('id', 'in', `(${blockedIds.join(',')})`)
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery.trim() && !!currentUserId,
  });

  const startConversation = async (otherUserId: string) => {
    try {
      const { data: existing } = await supabase
        .from('conversations')
        .select()
        .or(`and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`)
        .single();

      if (existing) {
        toast({
          description: "Conversation already exists",
        });
        return;
      }

      const { error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: currentUserId,
          participant2_id: otherUserId,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onOpenChange(false);
      setSearchQuery("");
      
      toast({
        description: "Conversation started successfully",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        variant: "destructive",
        description: "Failed to start conversation",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[300px] mt-4">
          <div className="space-y-2">
            {users?.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => startConversation(user.id)}
              >
                {user.username}
              </Button>
            ))}
            {searchQuery && users?.length === 0 && (
              <p className="text-center text-muted-foreground">No users found</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};