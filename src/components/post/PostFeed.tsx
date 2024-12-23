import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const PAGE_SIZE = 10;

interface PostFeedProps {
  filter?: "popular" | "recent" | "following" | "commented" | "daily";
  userId?: string;
  hashtag?: string;
}

export const PostFeed = ({ filter = "recent", userId, hashtag }: PostFeedProps) => {
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", filter, userId, hashtag],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            username,
            avatar_url
          ),
          likes:likes(count),
          comments:comments(count)
        `)
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

      // Add hashtag filter if provided
      if (hashtag) {
        query = query.ilike('content', `%#${hashtag}%`);
      }

      // Add user filter if provided
      if (userId) {
        query = query.eq('author_id', userId);
      }

      // Handle different filter types
      switch (filter) {
        case "following":
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return { data: [], nextPage: null };

          const { data: followingIds } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

          if (!followingIds?.length) return { data: [], nextPage: null };
          query = query.in('author_id', followingIds.map(f => f.following_id));
          break;
        case "daily":
          // Get today's prompt
          const today = new Date().toISOString().split('T')[0];
          const { data: prompt } = await supabase
            .from('daily_prompts')
            .select('id')
            .eq('active_date', today)
            .single();
          
          if (prompt) {
            query = query.ilike('content', `%#DailyPrompt${prompt.id}%`);
          }
          query = query.order('created_at', { ascending: false });
          break;
        case "commented":
        case "popular":
          // For both commented and popular, we'll sort by created_at first and then sort in JavaScript
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      // Sort posts based on filter type
      let sortedPosts = [...posts];
      if (filter === "popular") {
        sortedPosts.sort((a, b) => ((b.likes?.[0]?.count || 0) - (a.likes?.[0]?.count || 0)));
      } else if (filter === "commented") {
        sortedPosts.sort((a, b) => ((b.comments?.[0]?.count || 0) - (a.comments?.[0]?.count || 0)));
      }

      return {
        data: sortedPosts,
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000,
    refetchInterval: 5000,
  });

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
      
      <div ref={ref} className="h-8 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin" />
        )}
      </div>

      {data?.pages[0].data.length === 0 && (
        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
          {hashtag ? `No posts found with #${hashtag}` : 'No posts yet'}
        </div>
      )}
    </div>
  );
};