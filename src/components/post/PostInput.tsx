import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

interface PostInputProps {
  postContent: string;
  isAnonymous: boolean;
  useDailyPrompt: boolean;
  dailyPrompt?: { id: string; content: string } | null;
  onContentChange: (content: string) => void;
  onAnonymousChange: (isAnonymous: boolean) => void;
  onPromptToggle: () => void;
  onFileSelect: (file: File) => void;
  onPost: () => void;
  isPosting: boolean;
}

export const PostInput = ({
  postContent,
  isAnonymous,
  useDailyPrompt,
  dailyPrompt,
  onContentChange,
  onAnonymousChange,
  onPromptToggle,
  onFileSelect,
  onPost,
  isPosting,
}: PostInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const showExpandedView = isFocused || postContent.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <Textarea
              placeholder="Add to the Conversation..."
              value={postContent}
              onChange={(e) => onContentChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="min-h-[40px] resize-none"
              rows={3}
            />
          </div>
          {showExpandedView && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
                {dailyPrompt && (
                  <Toggle
                    pressed={useDailyPrompt}
                    onPressedChange={onPromptToggle}
                    className="px-3"
                  >
                    Daily Prompt
                  </Toggle>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => onAnonymousChange(e.target.checked)}
                    className="rounded"
                  />
                  Anonymous
                </label>
              </div>
              <Button 
                onClick={onPost}
                disabled={isPosting || !postContent.trim()}
                size="sm"
                className="ml-2"
              >
                {isPosting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};