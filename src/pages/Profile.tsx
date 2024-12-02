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
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { userId } = useParams();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const { toast } = useToast();

  // First, try to get the profile by either UUID or username
  const { data: profile, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      // Try UUID first
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let query;
      
      try {
        if (uuidRegex.test(userId || '')) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (error) throw error;
          return data;
        } else {
          // If not UUID, try username
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', userId)
            .maybeSingle();
          
          if (error) throw error;
          return data;
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        throw error;
      }
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
    queryKey: ["followStats", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profile.id),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profile.id),
      ]);
      return {
        followers: followers.count || 0,
        following: following.count || 0,
      };
    },
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", profile?.id],
    enabled: !!profile?.id && !!currentUser,
    queryFn: async () => {
      if (!currentUser) return false;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id);
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
      <div className="min-h-screen bg-background">
        <div className="pt-16 px-4 pb-20 max-w-2xl mx-auto">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
            <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          </div>
        </div>
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
          {currentUser && currentUser.id !== profile.id && (
            <FollowButton userId={profile.id} isFollowing={isFollowing || false} />
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
          userId={profile.id}
          type="followers"
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
        />
        <FollowListModal
          userId={profile.id}
          type="following"
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
        />
      </div>
    </div>
  );
};

export default Profile;