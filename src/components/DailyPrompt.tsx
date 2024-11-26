import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const DailyPrompt = () => {
  const { data: prompt } = useQuery({
    queryKey: ["dailyPrompt"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_prompts')
        .select('*')
        .eq('active_date', today)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!prompt) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Daily Prompt #{prompt.id}</h2>
        <Button variant="outline" size="sm">
          Minimize
        </Button>
      </div>
      <p className="text-gray-600 mb-3">{prompt.content}</p>
      <Button variant="outline">Participate</Button>
    </div>
  );
};