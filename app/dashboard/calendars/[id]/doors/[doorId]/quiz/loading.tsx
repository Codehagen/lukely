import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const QUESTION_ITEMS = Array.from({ length: 3 })
const FIELD_ROWS = Array.from({ length: 4 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster quizbygger…</span>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <Skeleton className="h-9 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELD_ROWS.map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {QUESTION_ITEMS.map((_, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="grid gap-2 md:grid-cols-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-end gap-3">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap justify-between gap-3">
              <Skeleton className="h-10 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
