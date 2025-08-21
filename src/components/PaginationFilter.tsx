import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface PaginationFilterProps {
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}
export function PaginationFilter({
  itemsPerPage,
  onItemsPerPageChange
}: PaginationFilterProps) {
  return <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Show:</span>
      <Select value={itemsPerPage.toString()} onValueChange={value => onItemsPerPageChange(Number(value))}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50" className="bg-zinc-100">50</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>;
}