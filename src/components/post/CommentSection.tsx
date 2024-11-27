import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommentHeader } from "./CommentHeader";
import { PostHeader } from "./PostHeader";

interface CommentSectionProps {
  postId: string;
  isAnonymousPost: boolean;
  originalPosterId: string;
  originalPost: {
    content: string;
    profiles: {
      username: string;
      avatar_url?: string | null;
    };
    created_at: string;
    is_anonymous: boolean;
  };
}

export const CommentSection = ({ 
  postId, 
  isAnonymousPost, 
  originalPosterId, 
  originalPost 
}: CommentSectionProps) => {
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

  const { data: mutedUsers } = useQuery({
    queryKey: ["mutedUsers"],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await supabase
        .from('muted_users')
        .select('muted_id')
        .eq('muter_id', currentUser.id);
      return data?.map(m => m.muted_id) || [];
    },
  });

  const { data: blockedUsers } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      if (!currentUser) return [];
      const { data } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', currentUser.id);
      return data?.map(b => b.blocked_id) || [];
    },
  });

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username, avatar_url)
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

      const finalIsAnonymous = isAnonymousPost && isAnonymous;

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

  const isUserBlocked = (userId: string) => blockedUsers?.includes(userId);
  const isUserMuted = (userId: string) => mutedUsers?.includes(userId);
  const canPostAnonymously = isAnonymousPost && currentUser?.id === originalPosterId;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Original Post */}
      <div className="p-4 border-b">
        <PostHeader
          username={originalPost.profiles.username}
          createdAt={originalPost.created_at}
          isAnonymous={originalPost.is_anonymous}
          authorId={originalPosterId}
          currentUserId={currentUser?.id}
          avatarUrl={originalPost.profiles.avatar_url}
        />
        {isUserMuted(originalPosterId) ? (
          <p className="mt-2 text-gray-500 italic">Content hidden from muted user</p>
        ) : (
          <p className="mt-2 text-gray-700">{originalPost.content}</p>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading comments...</div>
        ) : comments?.length === 0 ? (
          <div className="text-center text-gray-500">No comments yet</div>
        ) : (
          comments?.filter(comment => !isUserBlocked(comment.author_id))
            .map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <CommentHeader
                  username={comment.profiles.username}
                  createdAt={comment.created_at}
                  isAnonymous={comment.is_anonymous}
                  authorId={comment.author_id}
                  currentUserId={currentUser?.id}
                  avatarUrl={comment.profiles.avatar_url}
                  onDelete={() => handleDelete(comment.id)}
                />
                {isUserMuted(comment.author_id) ? (
                  <p className="text-gray-500 italic mt-1">Content hidden from muted user</p>
                ) : (
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Comment Input Form */}
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
