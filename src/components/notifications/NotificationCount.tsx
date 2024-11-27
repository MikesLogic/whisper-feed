import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NotificationCount = ({ className = "" }: { className?: string }) => {
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      return count || 0;
    },
  });

  if (!unreadCount) return null;

  return (
    <div className={`bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center ${className}`}>
      {unreadCount}
    </div>
  );
};