import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CommentSection } from "./CommentSection";

interface PostActionsProps {
  post: {
    id: string;
    content: string;
    is_anonymous: boolean;
    author_id: string;
    created_at: string;
    profiles: {
      username: string;
      avatar_url?: string | null;
    };
    likes: { count: number }[];
    comments: { count: number }[];
  };
  onLike: () => void;
  isLiking: boolean;
}

export const PostActions = ({ post, onLike, isLiking }: PostActionsProps) => {
  return (
    <div className="flex items-center gap-4 mt-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2"
        onClick={onLike}
        disabled={isLiking}
      >
        <Heart className="w-4 h-4" />
        {post.likes[0]?.count || 0}
      </Button>
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {post.comments[0]?.count || 0}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] p-0">
          <CommentSection 
            postId={post.id} 
            isAnonymousPost={post.is_anonymous} 
            originalPosterId={post.author_id}
            originalPost={{
              content: post.content,
              profiles: post.profiles,
              created_at: post.created_at,
              is_anonymous: post.is_anonymous,
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};