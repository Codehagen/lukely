import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const DOOR_ITEMS = Array.from({ length: 24 })

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster kalenderen…</span>

      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {DOOR_ITEMS.map((_, index) => (
            <Card key={index} className="aspect-square">
              <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t bg-background/95 py-6">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground md:px-8">
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </footer>
    </div>
  )
}
