import { useState, useEffect } from "react";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "@/components/post/CreatePost";
import { PostFeed } from "@/components/post/PostFeed";
import { DailyPrompt } from "@/components/DailyPrompt";
import { Navigation } from "@/components/Navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { NotificationCount } from "@/components/notifications/NotificationCount";

const Index = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({ username: profileData.username });
        }
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Success",
      description: "Signed out successfully",
    });
  };

  const tabs = [
    { id: "popular", label: "Popular" },
    { id: "recent", label: "Recent" },
    { id: "following", label: "Following" },
    { id: "commented", label: "Commented" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-primary z-50 shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary-hover"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
                <NotificationCount className="absolute -top-1 -right-1" />
              </Button>
            </div>
            <h1 className="text-xl font-semibold text-white">Anomours</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-primary-hover"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="flex overflow-x-auto bg-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="pt-28 px-4 pb-20 max-w-2xl mx-auto">
          <CreatePost />
          <DailyPrompt />
          <PostFeed filter={activeTab as "popular" | "recent" | "following" | "commented"} />
        </main>

        {/* Navigation Menu */}
        <Navigation
          profile={profile}
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
          isOpen={isMenuOpen}
        />

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        {/* Chat Drawer */}
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </TooltipProvider>
  );
};

export default Index;
