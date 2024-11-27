import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActionsMenu } from "./UserActionsMenu";

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
  avatarUrl 
}: PostHeaderProps) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src={isAnonymous ? undefined : avatarUrl} />
        <AvatarFallback>
          <User className="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-semibold">
              {isAnonymous ? "Anonymous" : username}
            </h3>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
          {currentUserId && (
            <UserActionsMenu
              targetUserId={authorId}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
    </div>
  );
};