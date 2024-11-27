import { MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserActionsMenuProps {
  targetUserId: string;
  currentUserId: string | undefined;
  onFollowToggle?: () => void;
}

export const UserActionsMenu = ({ targetUserId, currentUserId, onFollowToggle }: UserActionsMenuProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMuteUser = async () => {
    try {
      const { error } = await supabase
        .from('muted_users')
        .insert({
          muter_id: currentUserId,
          muted_id: targetUserId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User muted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["muted-users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mute user",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async () => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: currentUserId,
          blocked_id: targetUserId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  if (!currentUserId || currentUserId === targetUserId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onFollowToggle && (
          <DropdownMenuItem onClick={onFollowToggle}>
            Follow/Unfollow
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleMuteUser}>
          Mute User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlockUser}>
          Block User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};