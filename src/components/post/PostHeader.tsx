import { UserActionsMenu } from "./UserActionsMenu";
import { formatDistanceToNow } from "date-fns";
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
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl || ""} alt={username} />
          <AvatarFallback>{username[0]?.toUpperCase()}</AvatarFallback>
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
      <UserActionsMenu
        targetUserId={authorId}
        currentUserId={currentUserId}
      />
    </div>
  );
};