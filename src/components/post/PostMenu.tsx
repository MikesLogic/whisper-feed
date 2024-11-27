import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PostMenuProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const PostMenu = ({ postId, authorId, currentUserId, onDelete, onEdit }: PostMenuProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isOwnPost = currentUserId === authorId;

  const handleShare = async () => {
    try {
      await navigator.share({
        url: window.location.origin + `/post/${postId}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share post",
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
          blocked_id: authorId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  if (!currentUserId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleShare}>
          Share
        </DropdownMenuItem>
        {isOwnPost ? (
          <>
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleBlockUser}>
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem>
              Follow User
            </DropdownMenuItem>
            <DropdownMenuItem>
              Chat
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};