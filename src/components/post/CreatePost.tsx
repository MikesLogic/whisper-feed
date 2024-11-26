import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const CreatePost = () => {
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  const handlePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Post cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('posts')
        .insert({
          content: postContent,
          author_id: user.id,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      setPostContent("");
      setIsAnonymous(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
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
  );
};