import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CommentSubscriptionButtonProps {
  postId: string;
  currentUserId?: string;
}

export const CommentSubscriptionButton = ({ postId, currentUserId }: CommentSubscriptionButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isSubscribed } = useQuery({
    queryKey: ["commentSubscription", postId],
    queryFn: async () => {
      if (!currentUserId) return false;
      const { data } = await supabase
        .from('comment_subscriptions')
        .select()
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single();
      return !!data;
    },
  });

  const handleToggleSubscription = async () => {
    try {
      if (!currentUserId) return;

      if (isSubscribed) {
        const { error } = await supabase
          .from('comment_subscriptions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_subscriptions')
          .insert({
            post_id: postId,
            user_id: currentUserId,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["commentSubscription", postId] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  if (!currentUserId) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleSubscription}
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="w-4 h-4" />
          Unsubscribe
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Subscribe
        </>
      )}
    </Button>
  );
};