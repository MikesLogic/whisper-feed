import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";
import { Toggle } from "@/components/ui/toggle";
import { useQuery } from "@tanstack/react-query";

export const CreatePost = () => {
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPosting, setIsPosting] = useState(false);
  const [useDailyPrompt, setUseDailyPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      let mediaUrl = null;
      if (fileInputRef.current?.files?.length) {
        mediaUrl = await handleFileUpload(fileInputRef.current.files[0]);
        if (!mediaUrl) {
          setIsPosting(false);
          return;
        }
      }

      const finalContent = useDailyPrompt && dailyPrompt 
        ? `${postContent}\n\n#DailyPrompt${dailyPrompt.id}`
        : postContent;

      const { error } = await supabase
        .from('posts')
        .insert({
          content: finalContent,
          author_id: user.id,
          is_anonymous: isAnonymous,
          media_url: mediaUrl,
        });

      if (error) throw error;
      
      setPostContent("");
      setIsAnonymous(false);
      setUseDailyPrompt(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
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

  const handleTogglePrompt = () => {
    setUseDailyPrompt(!useDailyPrompt);
    if (!useDailyPrompt && dailyPrompt) {
      setPostContent(dailyPrompt.content);
    } else {
      setPostContent("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="mb-3">
            <Textarea
              placeholder="Add to the Conversation..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setUploadProgress(0);
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isPosting}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Upload
              </Button>
              {dailyPrompt && (
                <Toggle
                  pressed={useDailyPrompt}
                  onPressedChange={handleTogglePrompt}
                  className="px-3"
                >
                  Daily Prompt
                </Toggle>
              )}
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
            <Button 
              onClick={handlePost} 
              disabled={isUploading || isPosting}
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Post
            </Button>
          </div>
          {uploadProgress > 0 && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};