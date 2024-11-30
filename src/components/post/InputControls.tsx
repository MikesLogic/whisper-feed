import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputControlsProps {
  isAnonymous: boolean;
  onAnonymousChange: (isAnonymous: boolean) => void;
  onFileSelect: (file: File) => void;
  onPost: () => void;
  isPosting: boolean;
  postContent: string;
  useDailyPrompt: boolean;
  dailyPrompt?: { content: string } | null;
  onPromptToggle: () => void;
}

export const InputControls = ({
  isAnonymous,
  onAnonymousChange,
  onFileSelect,
  onPost,
  isPosting,
  postContent,
  useDailyPrompt,
  dailyPrompt,
  onPromptToggle,
}: InputControlsProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="flex items-center gap-2">
        {dailyPrompt && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={useDailyPrompt}
                  onPressedChange={onPromptToggle}
                  size="sm"
                  className="px-2"
                >
                  <Calendar className="h-4 w-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-sm">Use daily prompt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
  );
};