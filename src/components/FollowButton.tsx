import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export const FollowButton = ({ userId, isFollowing: initialIsFollowing }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: user.id, following_id: userId });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;
      }

      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["follows"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast({
        title: "Success",
        description: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "destructive" : "default"}
      size="sm"
      onClick={handleFollow}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Follow
        </>
      )}
    </Button>
  );
};