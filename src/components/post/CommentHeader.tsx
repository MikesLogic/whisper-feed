import { formatDistanceToNow } from "date-fns";
import { User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActionsMenu } from "./UserActionsMenu";

interface CommentHeaderProps {
  username: string;
  createdAt: string;
  isAnonymous: boolean;
  authorId: string;
  currentUserId?: string;
  avatarUrl?: string | null;
  onDelete?: () => void;
}

export const CommentHeader = ({
  username,
  createdAt,
  isAnonymous,
  authorId,
  currentUserId,
  avatarUrl,
  onDelete
}: CommentHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={isAnonymous ? undefined : avatarUrl} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <span className="font-medium">
            {isAnonymous ? "Anonymous" : username}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {currentUserId === authorId ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : currentUserId && (
          <UserActionsMenu
            targetUserId={authorId}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
};