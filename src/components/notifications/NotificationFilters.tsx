import { Button } from "@/components/ui/button";

type Filter = 'unread' | 'all' | 'likes' | 'comments' | 'mentions';

interface NotificationFiltersProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export const NotificationFilters = ({ activeFilter, onFilterChange }: NotificationFiltersProps) => {
  const filters: { value: Filter; label: string }[] = [
    { value: 'unread', label: 'Unread' },
    { value: 'all', label: 'History' },
    { value: 'likes', label: 'Likes' },
    { value: 'comments', label: 'Comments' },
    { value: 'mentions', label: 'Mentions' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="whitespace-nowrap"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};