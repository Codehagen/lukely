import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const FORM_SECTIONS = [5, 4, 3]
const SWITCH_ROWS = Array.from({ length: 4 })

export default function Loading() {
  return (
    <div
      className="flex-1 space-y-4 p-4 pt-6 md:p-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster kalenderinnstillinger…</span>

      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="space-y-6">
        {FORM_SECTIONS.map((fieldCount, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: fieldCount }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-60" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {SWITCH_ROWS.map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
    </div>
  )
}
