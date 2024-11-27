import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'unread' | 'all' | 'likes' | 'comments' | 'mentions';

export const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('unread');

  const { data: notifications } = useQuery({
    queryKey: ["notifications", activeFilter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      switch (activeFilter) {
        case 'unread':
          query = query.eq('is_read', false);
          break;
        case 'likes':
          query = query.eq('type', 'like');
          break;
        case 'comments':
          query = query.or('type.eq.comment,type.eq.comment_reply');
          break;
        case 'mentions':
          query = query.eq('type', 'mention');
          break;
        // 'all' doesn't need additional filtering
      }

      const { data } = await query;
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
        <div className="space-y-4">
          <NotificationFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};