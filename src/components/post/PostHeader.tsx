import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActionsMenu } from "./UserActionsMenu";
import { Link } from "react-router-dom";

interface PostHeaderProps {
  username: string;
  createdAt: string;
  isAnonymous: boolean;
  authorId: string;
  currentUserId?: string;
  avatarUrl?: string | null;
}

export const PostHeader = ({
  username,
  createdAt,
  isAnonymous,
  authorId,
  currentUserId,
  avatarUrl,
}: PostHeaderProps) => {
  if (isAnonymous) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-medium">Anonymous</span>
            <span className="text-sm text-gray-500 ml-2">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <Link to={`/profile/${authorId}`} className="flex items-center gap-2 hover:opacity-80">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="font-medium">{username}</span>
          <span className="text-sm text-gray-500 ml-2">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </Link>
      {currentUserId && currentUserId !== authorId && (
        <UserActionsMenu
          targetUserId={authorId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};