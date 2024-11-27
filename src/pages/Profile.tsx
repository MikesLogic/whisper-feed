import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/ProfileCard";
import { PostFeed } from "@/components/post/PostFeed";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { userId } = useParams();

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
        <ProfileCard profile={profile} />
        <PostFeed filter="recent" userId={profile.id} />
      </div>
    </div>
  );
};

export default Profile;