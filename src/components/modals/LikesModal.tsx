import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

interface LikesModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LikesModal = ({ postId, isOpen, onClose }: LikesModalProps) => {
  const { data: likes } = useQuery({
    queryKey: ["likes", postId],
    queryFn: async () => {
      const { data } = await supabase
        .from('likes')
        .select(`
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId);
      return data?.map(like => like.profiles) || [];
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Likes</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {likes?.map((user) => (
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
          {likes?.length === 0 && (
            <p className="text-center text-gray-500">No likes yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};