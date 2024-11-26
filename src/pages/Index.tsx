import { useState, useEffect } from "react";
import { Menu, Bell, Settings, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  username: string;
  email: string;
  created_at: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [postContent, setPostContent] = useState("");
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

  const handlePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Post cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement post creation when posts table is added
    toast({
      title: "Success",
      description: "Post created successfully!",
    });
    setPostContent("");
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
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-4 pb-20 max-w-2xl mx-auto">
        {/* User Profile Info */}
        {profile && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold">{profile.username}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Post Input */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <Input
                placeholder="Add to the Conversation..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    Anonymous
                  </label>
                </div>
                <Button onClick={handlePost}>Post</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Prompt */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Daily Prompt #36</h2>
            <Button variant="outline" size="sm">
              Minimize
            </Button>
          </div>
          <p className="text-gray-600 mb-3">
            What's your favorite way to spend time outdoors?
          </p>
          <Button variant="outline">Participate</Button>
        </div>

        {/* Feed will be implemented here */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 mb-4">No posts yet</p>
          </div>
        </div>
      </main>

      {/* Navigation Menu (Left Slide-out) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white animate-slide-in-left">
            <div className="p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="absolute right-2 top-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="space-y-4 mt-10">
                <button className="nav-item">
                  <User className="h-5 w-5" />
                  {profile?.username || 'Profile'}
                </button>
                <button className="nav-item">
                  <Bell className="h-5 w-5" />
                  Notifications
                </button>
                <button className="nav-item">
                  <Search className="h-5 w-5" />
                  Search
                </button>
                <button className="nav-item">
                  <Settings className="h-5 w-5" />
                  Settings
                </button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;