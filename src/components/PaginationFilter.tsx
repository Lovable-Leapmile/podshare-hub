import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PaginationFilterProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function PaginationFilter({ itemsPerPage, onItemsPerPageChange, searchQuery = "", onSearchChange }: PaginationFilterProps) {
  return (
    <div className="flex items-center justify-between gap-3 h-10">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reservations..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
        <SelectTrigger className="w-16 h-10">
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