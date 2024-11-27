import { Menu, User, Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ProfileEditModal } from "./modals/ProfileEditModal";
import { SettingsModal } from "./modals/SettingsModal";
import { SearchModal } from "./modals/SearchModal";
import { NotificationsModal } from "./modals/NotificationsModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface NavigationProps {
  profile: {
    username: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
  isOpen: boolean;
}

export const Navigation = ({ profile, onClose, onLogout, isOpen }: NavigationProps) => {
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | 'search' | 'notifications' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));
    
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for beforeinstallprompt (Chrome/Edge/Android Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (activeModal) {
      navigate(`${location.pathname}?modal=${activeModal}`, { replace: false });
    }
  }, [activeModal, navigate, location.pathname]);

  useEffect(() => {
    const handleLocationChange = () => {
      if (!location.search.includes('modal=')) {
        setActiveModal(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [location]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast({
          title: "Success",
          description: "App installation started",
        });
      }
    } else if (isIOS) {
      toast({
        title: "Install on iOS",
        description: "Tap the share button and select 'Add to Home Screen'",
      });
    } else if (isAndroid) {
      toast({
        title: "Install on Android",
        description: "Tap the menu button (⋮) and select 'Add to Home Screen'",
      });
    }
  };

  const handleModalOpen = (modalType: typeof activeModal) => {
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    if (location.search.includes('modal=')) {
      navigate(-1);
    }
    setActiveModal(null);
  };

  const showInstallButton = (deferredPrompt || isIOS || isAndroid) && !isStandalone;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
        } z-50`}
        onClick={onClose}
      >
        <div 
          className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
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
    </>
  );
};