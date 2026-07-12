import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Renders inside the real <Table>/<TableBody> (same header, same cell
// padding) instead of a freestanding block of bars — matching row height and
// keeping the column header mounted avoids the whole card resizing/jumping
// the moment data replaces the loading state.
export function TableSkeletonRows({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j} className={j === 0 ? "pl-4" : undefined}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
