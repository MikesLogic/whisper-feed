import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const BlockedMutedUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockedUsers } = useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          blocked_id,
          profiles!blocked_users_blocked_id_fkey (username)
        `)
        .eq('blocker_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const { data: mutedUsers } = useQuery({
    queryKey: ["muted-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('muted_users')
        .select(`
          muted_id,
          profiles!muted_users_muted_id_fkey (username)
        `)
        .eq('muter_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const handleUnblock = async (blockedId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .match({ blocker_id: user.id, blocked_id: blockedId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unblocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive",
      });
    }
  };

  const handleUnmute = async (mutedId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('muted_users')
        .delete()
        .match({ muter_id: user.id, muted_id: mutedId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unmuted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["muted-users"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unmute user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Blocked Users</h3>
        <div className="mt-2 space-y-2">
          {blockedUsers?.map((user) => (
            <div key={user.blocked_id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{user.profiles.username}</span>
              <Button size="sm" onClick={() => handleUnblock(user.blocked_id)}>
                Unblock
              </Button>
            </div>
          ))}
          {(!blockedUsers || blockedUsers.length === 0) && (
            <p className="text-gray-500">No blocked users</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Muted Users</h3>
        <div className="mt-2 space-y-2">
          {mutedUsers?.map((user) => (
            <div key={user.muted_id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{user.profiles.username}</span>
              <Button size="sm" onClick={() => handleUnmute(user.muted_id)}>
                Unmute
              </Button>
            </div>
          ))}
          {(!mutedUsers || mutedUsers.length === 0) && (
            <p className="text-gray-500">No muted users</p>
          )}
        </div>
      </div>
    </div>
  );
};