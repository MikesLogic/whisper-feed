import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const PAGE_SIZE = 10;

export const PostFeed = ({ filter = "recent" }: { filter?: "popular" | "recent" | "following" | "commented" }) => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", filter],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (username),
          likes:likes(count),
          comments:comments(count)
        `)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      if (filter === "following") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], nextPage: null };

        const { data: followingIds } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        if (!followingIds?.length) return { data: [], nextPage: null };

        query = query.in('author_id', followingIds.map(f => f.following_id));
      } else {
        switch (filter) {
          case "popular":
            query = query.order('likes(count)', { ascending: false });
            break;
          case "commented":
            query = query.order('comments(count)', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      return {
        data: posts,
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
      }, () => {
        // Invalidate and refetch posts when changes occur
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Trigger next page fetch when the last element is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.pages.map((page, i) => (
        <div key={i} className="space-y-4">
          {page.data.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      
      {/* Loading indicator for next page */}
      <div ref={ref} className="h-8 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin" />
        )}
      </div>

      {/* No posts message */}
      {data?.pages[0].data.length === 0 && (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          No posts yet
        </div>
      )}
    </div>
  );
};