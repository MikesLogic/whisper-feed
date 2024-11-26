import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FollowButton } from "./FollowButton";

interface ProfileCardProps {
  profile: {
    id: string;
    username: string;
    email: string;
  };
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { data: stats } = useQuery({
    queryKey: ["profileStats", profile.id],
    queryFn: async () => {
      const [followersResponse, followingResponse] = await Promise.all([
        supabase
          .from('follows')
          .select('count')
          .eq('following_id', profile.id),
        supabase
          .from('follows')
          .select('count')
          .eq('follower_id', profile.id),
      ]);

      if (followersResponse.error) throw followersResponse.error;
      if (followingResponse.error) throw followingResponse.error;

      return {
        followers: followersResponse.count || 0,
        following: followingResponse.count || 0,
      };
    },
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", profile.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count, error } = await supabase
        .from('follows')
        .select('count')
        .match({
          follower_id: user.id,
          following_id: profile.id,
        });

      if (error) throw error;
      return count > 0;
    },
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{profile.username}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <FollowButton userId={profile.id} isFollowing={isFollowing || false} />
          </div>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>{stats?.followers || 0} followers</span>
            <span>{stats?.following || 0} following</span>
          </div>
        </div>
      </div>
    </div>
  );
};