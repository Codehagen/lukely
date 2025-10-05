import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const STAT_CARDS = Array.from({ length: 4 })
const RECENT_CALENDARS = Array.from({ length: 3 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster dashbord…</span>

      <div className="flex flex-col space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3 pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="hidden h-9 w-28 sm:block" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {RECENT_CALENDARS.map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 transition-colors sm:flex-row sm:items-center"
            >
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
