import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BlockedMutedUsers } from "@/components/settings/BlockedMutedUsers";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: existingSettings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSettings) return existingSettings;

      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (insertError) {
        toast({
          title: "Error",
          description: "Failed to create settings",
          variant: "destructive",
        });
        return null;
      }

      return newSettings;
    },
  });

  const updateSetting = async (field: string, value: boolean | string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('settings')
      .update({ [field]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["userSettings"] });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Enable Notifications</label>
              <Switch
                checked={settings?.notifications_enabled || false}
                onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email Notifications</label>
              <Switch
                checked={settings?.email_notifications || false}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Theme</label>
              <select
                className="border rounded p-1"
                value={settings?.theme || 'light'}
                onChange={(e) => updateSetting('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <BlockedMutedUsers />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};