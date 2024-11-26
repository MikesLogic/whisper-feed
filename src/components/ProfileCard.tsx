import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FollowButton } from "./FollowButton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

interface ProfileCardProps {
  profile: {
    id: string;
    username: string;
    email: string;
    alias?: string | null;
  };
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [alias, setAlias] = useState(profile.alias || '');
  const { toast } = useToast();
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

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

  const handleSaveAlias = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ alias })
      .eq('id', profile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update alias",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Alias updated successfully",
    });
    setIsEditing(false);
  };

  const isOwnProfile = currentUser?.id === profile.id;

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
              {isEditing && isOwnProfile ? (
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Set your alias"
                    className="h-8"
                  />
                  <Button size="sm" onClick={handleSaveAlias}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  {profile.alias && <p className="text-sm text-gray-600">Known as: {profile.alias}</p>}
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="mt-1"
                    >
                      {profile.alias ? 'Edit alias' : 'Add alias'}
                    </Button>
                  )}
                </>
              )}
            </div>
            {!isOwnProfile && (
              <FollowButton userId={profile.id} isFollowing={isFollowing || false} />
            )}
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