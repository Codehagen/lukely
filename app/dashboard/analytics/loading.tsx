import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STAT_CARDS = Array.from({ length: 3 })
const CALENDAR_ROWS = Array.from({ length: 5 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster analyser…</span>

      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STAT_CARDS.map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2 pb-3">
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {CALENDAR_ROWS.map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
