import { Calendar } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DailyPromptToggleProps {
  dailyPrompt: { content: string } | null;
  useDailyPrompt: boolean;
  onPromptToggle: () => void;
}

export const DailyPromptToggle = ({
  dailyPrompt,
  useDailyPrompt,
  onPromptToggle,
}: DailyPromptToggleProps) => {
  if (!dailyPrompt) return null;

  return (
    <div className="mb-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              pressed={useDailyPrompt}
              onPressedChange={onPromptToggle}
              className="w-full justify-start px-3 py-2 text-left"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">Daily Prompt</div>
                <div className="text-sm text-muted-foreground truncate">
                  {dailyPrompt.content}
                </div>
              </div>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[300px]">
            <p className="text-sm">
              Click to use today&apos;s prompt: {dailyPrompt.content}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};