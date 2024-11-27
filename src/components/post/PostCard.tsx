import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    is_anonymous: boolean;
    author_id: string;
    media_url: string | null;
    profiles: {
      username: string;
      avatar_url?: string | null;
    };
    likes: { count: number }[];
    comments: { count: number }[];
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isMuted } = useQuery({
    queryKey: ["isMuted", post.author_id],
    queryFn: async () => {
      if (!currentUser) return false;
      const { count } = await supabase
        .from('muted_users')
        .select('*', { count: 'exact', head: true })
        .eq('muter_id', currentUser.id)
        .eq('muted_id', post.author_id);
      return count > 0;
    },
  });

  const { data: isBlocked } = useQuery({
    queryKey: ["isBlocked", post.author_id],
    queryFn: async () => {
      if (!currentUser) return false;
      const { count } = await supabase
        .from('blocked_users')
        .select('*', { count: 'exact', head: true })
        .eq('blocker_id', currentUser.id)
        .eq('blocked_id', post.author_id);
      return count > 0;
    },
  });

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to like posts",
          variant: "destructive",
        });
        return;
      }

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        toast({
          title: "Success",
          description: "Post unliked",
        });
      } else {
        const { error: insertError } = await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (insertError) throw insertError;

        toast({
          title: "Success",
          description: "Post liked",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  if (isBlocked) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <PostHeader
        username={post.profiles.username}
        createdAt={post.created_at}
        isAnonymous={post.is_anonymous}
        authorId={post.author_id}
        currentUserId={currentUser?.id}
        avatarUrl={post.profiles.avatar_url}
      />
      <PostContent 
        content={post.content}
        mediaUrl={post.media_url}
        isMuted={isMuted}
      />
      <PostActions 
        post={post}
        onLike={handleLike}
        isLiking={isLiking}
      />
    </div>
  );
};