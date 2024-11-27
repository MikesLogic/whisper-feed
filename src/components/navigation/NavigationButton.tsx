import { ReactNode } from "react";

interface NavigationButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badge?: ReactNode;
}

export const NavigationButton = ({ icon, label, onClick, badge }: NavigationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-lg relative"
    >
      <div className="relative">
        {icon}
        {badge && (
          <div className="absolute -top-2 -right-2">
            {badge}
          </div>
        )}
      </div>
      {label}
    </button>
  );
};