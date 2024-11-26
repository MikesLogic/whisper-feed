import { Menu, User, Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ProfileEditModal } from "./modals/ProfileEditModal";
import { SettingsModal } from "./modals/SettingsModal";
import { SearchModal } from "./modals/SearchModal";
import { NotificationsModal } from "./modals/NotificationsModal";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationProps {
  profile: {
    username: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
}

export const Navigation = ({ profile, onClose, onLogout }: NavigationProps) => {
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | 'search' | 'notifications' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (activeModal) {
      // Push a new entry to the history stack when opening a modal
      navigate(`${location.pathname}?modal=${activeModal}`, { replace: false });
    }
  }, [activeModal, navigate, location.pathname]);

  useEffect(() => {
    // Listen for popstate (back/forward button) events
    const handleLocationChange = () => {
      if (!location.search.includes('modal=')) {
        setActiveModal(null);
        onClose();
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [location, onClose]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleModalOpen = (modalType: typeof activeModal) => {
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    // When closing a modal, go back in history if we're on a modal route
    if (location.search.includes('modal=')) {
      navigate(-1);
    }
    setActiveModal(null);
  };

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
            <button
              onClick={() => handleModalOpen('profile')}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="h-5 w-5" />
              {profile?.username || 'Profile'}
            </button>
            <button
              onClick={() => handleModalOpen('notifications')}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5" />
              Notifications
            </button>
            <button
              onClick={() => handleModalOpen('search')}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
            <button
              onClick={() => handleModalOpen('settings')}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="h-5 w-5" />
              Settings
            </button>
            {deferredPrompt && (
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
        </div>
      </div>

      <ProfileEditModal
        isOpen={activeModal === 'profile'}
        onClose={handleModalClose}
      />
      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={handleModalClose}
      />
      <SearchModal
        isOpen={activeModal === 'search'}
        onClose={handleModalClose}
      />
      <NotificationsModal
        isOpen={activeModal === 'notifications'}
        onClose={handleModalClose}
      />
    </div>
  );
};