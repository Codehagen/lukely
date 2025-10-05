import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const TEMPLATE_CARDS = Array.from({ length: 4 })
const STEPS = Array.from({ length: 5 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-6 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster kalenderoppretting…</span>

      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {STEPS.map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
            {index < STEPS.length - 1 && (
              <Skeleton className="h-px w-10" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TEMPLATE_CARDS.map((_, index) => (
              <Card key={index}>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
