import {
  Command,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

interface MentionsListProps {
  show: boolean;
  results: Array<{ username: string }>;
  onSelect: (username: string) => void;
}

export const MentionsList = ({ show, results, onSelect }: MentionsListProps) => {
  if (!show || results.length === 0) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
      <Command className="rounded-lg border shadow-md">
        <CommandList>
          {results.map((user) => (
            <CommandItem
              key={user.username}
              onSelect={() => onSelect(user.username)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              @{user.username}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
};