import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";

export const PostFeed = ({ filter = "recent" }: { filter?: "popular" | "recent" | "following" | "commented" }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", filter],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (username),
          likes (count),
          comments (count)
        `);

      switch (filter) {
        case "popular":
          query = query.order('likes.count', { ascending: false });
          break;
        case "commented":
          query = query.order('comments.count', { ascending: false });
          break;
        case "following":
          // TODO: Implement following filter
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {posts?.length === 0 && (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          No posts yet
        </div>
      )}
    </div>
  );
};