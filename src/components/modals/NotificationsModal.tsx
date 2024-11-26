import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return data || [];
    },
  });

  useEffect(() => {
    if (isOpen) {
      const markNotificationsAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };

      markNotificationsAsRead();
    }
  }, [isOpen, queryClient]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <p className="text-sm">{notification.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {(!notifications || notifications.length === 0) && (
            <p className="text-center text-gray-500">No notifications</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};