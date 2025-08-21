import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationFilterProps {
  itemsPerPage: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function PaginationFilter({
  itemsPerPage,
  searchQuery,
  onSearchChange,
  onItemsPerPageChange
}: PaginationFilterProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <Input
        placeholder="Search reservations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 max-w-sm"
      />
      <Select 
        value={itemsPerPage.toString()} 
        onValueChange={value => onItemsPerPageChange(Number(value))}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}