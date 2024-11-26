import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              {post.likes[0]?.count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              {post.comments[0]?.count || 0}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};