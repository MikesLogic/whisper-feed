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
  originalPost: {
    content: string;
    profiles: {
      username: string;
    };
    created_at: string;
    is_anonymous: boolean;
  };
}

export const CommentSection = ({ postId, isAnonymousPost, originalPosterId, originalPost }: CommentSectionProps) => {
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
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Original Post */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {originalPost.is_anonymous ? "Anonymous" : originalPost.profiles.username}
              </h3>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(originalPost.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{originalPost.content}</p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

      {/* Comment Input Form - Fixed at bottom */}
      <div className="border-t p-4 bg-white">
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
      </div>
    </div>
  );
};