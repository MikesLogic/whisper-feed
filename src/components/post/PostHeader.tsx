import { UserActionsMenu } from "./UserActionsMenu";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={isAnonymous ? undefined : avatarUrl} alt={username} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">
            {isAnonymous ? "Anonymous" : username}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      {currentUserId && currentUserId !== authorId && (
        <UserActionsMenu
          targetUserId={authorId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};