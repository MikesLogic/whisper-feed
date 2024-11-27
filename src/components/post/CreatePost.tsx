import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { PostInput } from "./PostInput";
import { UploadProgress } from "./UploadProgress";

export const CreatePost = () => {
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const [useDailyPrompt, setUseDailyPrompt] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dailyPrompt } = useQuery({
    queryKey: ["dailyPrompt"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('active_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://tuaavguqfgmeazqwgtcf.functions.supabase.co/upload-post-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { publicUrl } = await response.json();
      return publicUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
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

    setIsPosting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const finalContent = useDailyPrompt && dailyPrompt 
        ? `${postContent}\n\n#DailyPrompt${dailyPrompt.id}`
        : postContent;

      const { error } = await supabase
        .from('posts')
        .insert({
          content: finalContent,
          author_id: user.id,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;
      
      setPostContent("");
      setIsAnonymous(false);
      setUseDailyPrompt(false);
      
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-[7.5rem] z-40">
      <PostInput
        postContent={postContent}
        isAnonymous={isAnonymous}
        useDailyPrompt={useDailyPrompt}
        dailyPrompt={dailyPrompt}
        onContentChange={setPostContent}
        onAnonymousChange={setIsAnonymous}
        onPromptToggle={() => {
          setUseDailyPrompt(!useDailyPrompt);
          if (!useDailyPrompt && dailyPrompt) {
            setPostContent(dailyPrompt.content);
          } else {
            setPostContent("");
          }
        }}
        onFileSelect={handleFileUpload}
        onPost={handlePost}
        isPosting={isPosting}
      />
      <UploadProgress progress={uploadProgress} />
    </div>
  );
};
