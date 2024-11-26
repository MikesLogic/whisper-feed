import { Menu, User, Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  profile: {
    username: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
}

export const Navigation = ({ profile, onClose, onLogout }: NavigationProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white animate-slide-in-left">
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="space-y-4 mt-10">
            <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg">
              <User className="h-5 w-5" />
              {profile?.username || 'Profile'}
            </button>
            <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              Notifications
            </button>
            <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-5 w-5" />
              Search
            </button>
            <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
              Settings
            </button>
            <Button 
              onClick={onLogout}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};