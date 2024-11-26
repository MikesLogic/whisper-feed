import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  postId: string;
  isAnonymousPost: boolean;
  originalPosterId: string;
}

export const CommentSection = ({ postId, isAnonymousPost, originalPosterId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const canPostAnonymously = isAnonymousPost && currentUser?.id === originalPosterId;

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!currentUser) throw new Error("Not authenticated");

      // Only allow anonymous comments if the post is anonymous and the commenter is the original poster
      const finalIsAnonymous = canPostAnonymously ? isAnonymous : false;

      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          post_id: postId,
          author_id: currentUser.id,
          is_anonymous: finalIsAnonymous,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      setNewComment("");
      setIsAnonymous(false);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Comments</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex items-center justify-between">
          {canPostAnonymously && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              Anonymous
            </label>
          )}
          <Button type="submit">Comment</Button>
        </div>
      </form>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading comments...</div>
        ) : comments?.length === 0 ? (
          <div className="text-center text-gray-500">No comments yet</div>
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {comment.is_anonymous ? "Anonymous" : comment.profiles.username}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {currentUser?.id === comment.author_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(comment.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};