import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CommentSection } from "./CommentSection";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    is_anonymous: boolean;
    profiles: {
      username: string;
    };
    likes: { count: number }[];
    comments: { count: number }[];
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: post.id,
          user_id: user.id,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          // Unlike the post
          await supabase
            .from('likes')
            .delete()
            .match({ post_id: post.id, user_id: user.id });
        } else {
          throw error;
        }
      }

      // Invalidate queries to refresh the post feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast({
        title: "Success",
        description: error ? "Post unliked" : "Post liked",
      });
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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {post.is_anonymous ? "Anonymous" : post.profiles.username}
            </h3>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-2 text-gray-700">{post.content}</p>
          <div className="flex items-center gap-4 mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className="w-4 h-4" />
              {post.likes[0]?.count || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              {post.comments[0]?.count || 0}
            </Button>
          </div>
          {showComments && <CommentSection postId={post.id} />}
        </div>
      </div>
    </div>
  );
};