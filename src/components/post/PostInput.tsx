import { useState, useRef } from "react";
import { User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { InputControls } from "./InputControls";
import { MentionsList } from "./MentionsList";
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
  const [isFocused, setIsFocused] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionResults, setMentionResults] = useState<Array<{ username: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showExpandedView = isFocused || postContent.length > 0;

  const handleContentChange = async (content: string) => {
    onContentChange(content);
    
    const lastWord = content.split(/\s/).pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      setMentionSearch(lastWord.slice(1));
      setShowMentions(true);
      
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

  return (
    <div ref={containerRef}>
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
            <MentionsList
              show={showMentions}
              results={mentionResults}
              onSelect={(username) => {
                if (!textareaRef.current) return;
                const content = postContent;
                const lastIndex = content.lastIndexOf("@");
                const newContent = content.substring(0, lastIndex) + `@${username} `;
                onContentChange(newContent);
                setShowMentions(false);
                textareaRef.current.focus();
              }}
            />
          </div>
          {showExpandedView && (
            <InputControls
              isAnonymous={isAnonymous}
              onAnonymousChange={onAnonymousChange}
              onFileSelect={onFileSelect}
              onPost={onPost}
              isPosting={isPosting}
              postContent={postContent}
              useDailyPrompt={useDailyPrompt}
              dailyPrompt={dailyPrompt}
              onPromptToggle={onPromptToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
};