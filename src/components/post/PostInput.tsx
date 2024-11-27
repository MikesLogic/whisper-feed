import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { 
  Command,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

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
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionResults, setMentionResults] = useState<Array<{ username: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showExpandedView = isFocused || postContent.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleContentChange = async (content: string) => {
    onContentChange(content);
    
    // Check for @ mentions
    const lastWord = content.split(/\s/).pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      setMentionSearch(lastWord.slice(1));
      setShowMentions(true);
      
      // Search for users
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', `${lastWord.slice(1)}%`)
        .limit(5);
      
      setMentionResults(data || []);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username: string) => {
    if (!textareaRef.current) return;

    const content = postContent;
    const lastIndex = content.lastIndexOf("@");
    const newContent = content.substring(0, lastIndex) + `@${username} `;
    
    onContentChange(newContent);
    setShowMentions(false);
    textareaRef.current.focus();
  };

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
          <div className="mb-2 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Add to the Conversation..."
              value={postContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="min-h-[40px] resize-none"
              rows={3}
            />
            {showMentions && mentionResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
                <Command className="rounded-lg border shadow-md">
                  <CommandList>
                    {mentionResults.map((user) => (
                      <CommandItem
                        key={user.username}
                        onSelect={() => insertMention(user.username)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        @{user.username}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </div>
            )}
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