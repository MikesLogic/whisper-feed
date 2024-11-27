import { User, Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationCount } from "@/components/notifications/NotificationCount";
import { NavigationButton } from "./NavigationButton";

interface NavigationContentProps {
  profile: {
    username: string;
  } | null;
  onModalOpen: (modal: 'profile' | 'settings' | 'search' | 'notifications' | null) => void;
  onLogout: () => void;
  showInstallButton: boolean;
  handleInstallClick: () => void;
}

export const NavigationContent = ({ 
  profile, 
  onModalOpen, 
  onLogout, 
  showInstallButton,
  handleInstallClick 
}: NavigationContentProps) => {
  return (
    <div className="space-y-4 mt-10">
      <NavigationButton
        icon={<User className="h-5 w-5" />}
        label={profile?.username || 'Profile'}
        onClick={() => onModalOpen('profile')}
      />
      <NavigationButton
        icon={<Bell className="h-5 w-5" />}
        label="Notifications"
        onClick={() => onModalOpen('notifications')}
        badge={<NotificationCount />}
      />
      <NavigationButton
        icon={<Search className="h-5 w-5" />}
        label="Search"
        onClick={() => onModalOpen('search')}
      />
      <NavigationButton
        icon={<Settings className="h-5 w-5" />}
        label="Settings"
        onClick={() => onModalOpen('settings')}
      />
      {showInstallButton && (
        <Button
          onClick={handleInstallClick}
          className="w-full"
          variant="outline"
        >
          Install App
        </Button>
      )}
      <Button 
        onClick={onLogout}
        variant="destructive"
        className="w-full"
      >
        Sign Out
      </Button>
    </div>
  );
};