import { User } from "lucide-react";

interface ProfileCardProps {
  profile: {
    username: string;
    email: string;
  };
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-semibold">{profile.username}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>
    </div>
  );
};