import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/ProfileCard";
import { PostFeed } from "@/components/post/PostFeed";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/FollowButton";
import { FollowListModal } from "@/components/modals/FollowListModal";

const Profile = () => {
  const { userId } = useParams();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: followStats } = useQuery({
    queryKey: ["followStats", userId],
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);
      return {
        followers: followers.count || 0,
        following: following.count || 0,
      };
    },
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", userId],
    queryFn: async () => {
      if (!currentUser) return false;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId);
      return count > 0;
    },
  });

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 text-center">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-16 px-4 pb-20 max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {currentUser && currentUser.id !== userId && (
            <FollowButton userId={userId} isFollowing={isFollowing || false} />
          )}
        </div>
        <ProfileCard profile={profile} />
        <div className="flex justify-center gap-8 my-6">
          <Button
            variant="ghost"
            onClick={() => setShowFollowers(true)}
          >
            {followStats?.followers || 0} Followers
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowFollowing(true)}
          >
            {followStats?.following || 0} Following
          </Button>
        </div>
        <PostFeed filter="recent" userId={profile.id} />
        <FollowListModal
          userId={userId}
          type="followers"
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
        />
        <FollowListModal
          userId={userId}
          type="following"
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
        />
      </div>
    </div>
  );
};

export default Profile;