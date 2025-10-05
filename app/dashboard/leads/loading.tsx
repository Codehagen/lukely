import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const TABLE_ROWS = Array.from({ length: 7 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster alle leads…</span>

      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="hidden grid-cols-6 gap-4 text-xs font-medium text-muted-foreground lg:grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            {TABLE_ROWS.map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid gap-3 rounded-lg border p-4 text-sm lg:grid-cols-6"
              >
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <Skeleton key={cellIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
