import { useState, useEffect } from "react";
import { Menu, Bell, Settings, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreatePost } from "@/components/post/CreatePost";
import { PostFeed } from "@/components/post/PostFeed";
import { DailyPrompt } from "@/components/DailyPrompt";
import { ProfileCard } from "@/components/ProfileCard";
import { Navigation } from "@/components/Navigation";

interface Profile {
  username: string;
  email: string;
  created_at: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username, email, created_at')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold text-primary">Anomo World</h1>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
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

      {/* Main Content */}
      <main className="pt-28 px-4 pb-20 max-w-2xl mx-auto">
        {profile && <ProfileCard profile={profile} />}
        <CreatePost />
        <DailyPrompt />
        <PostFeed filter={activeTab as "popular" | "recent" | "following" | "commented"} />
      </main>

      {/* Navigation Menu */}
      {isMenuOpen && (
        <Navigation
          profile={profile}
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Index;