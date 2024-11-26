import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: searchResults } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,alias.ilike.%${searchTerm}%`)
        .limit(5);

      return profiles || [];
    },
    enabled: searchTerm.length > 0,
  });

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="space-y-2">
            {searchResults?.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => handleUserClick(profile.id)}
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{profile.username}</p>
                  {profile.alias && (
                    <p className="text-sm text-gray-500">Known as: {profile.alias}</p>
                  )}
                </div>
              </div>
            ))}
            {searchTerm && searchResults?.length === 0 && (
              <p className="text-center text-gray-500">No users found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};