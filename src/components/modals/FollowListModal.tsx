import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface FollowListModalProps {
  userId: string;
  type: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
}

export const FollowListModal = ({ userId, type, isOpen, onClose }: FollowListModalProps) => {
  const { data: users } = useQuery({
    queryKey: ["follows", type, userId],
    queryFn: async () => {
      if (type === "followers") {
        const { data } = await supabase
          .from('follows')
          .select(`
            follower:profiles!follows_follower_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('following_id', userId);
        return data?.map(item => item.follower) || [];
      } else {
        const { data } = await supabase
          .from('follows')
          .select(`
            following:profiles!follows_following_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('follower_id', userId);
        return data?.map(item => item.following) || [];
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type === "followers" ? "Followers" : "Following"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {users?.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
              onClick={onClose}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.username}</span>
            </Link>
          ))}
          {users?.length === 0 && (
            <p className="text-center text-gray-500">
              No {type === "followers" ? "followers" : "following"} yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};