import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const FEATURES = Array.from({ length: 6 })
const STEPS = Array.from({ length: 3 })
const TESTIMONIALS = Array.from({ length: 2 })

export default function Loading() {
  return (
    <div
      className="min-h-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster forsiden…</span>

      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="container relative z-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Skeleton className="mb-4 h-7 w-64" />
            <Skeleton className="h-12 w-full max-w-xl" />
            <Skeleton className="mt-6 h-4 w-full max-w-2xl" />
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Skeleton className="h-12 w-44" />
              <Skeleton className="h-12 w-40" />
            </div>
            <Skeleton className="mt-4 h-4 w-48" />
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] opacity-20" />
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Skeleton className="mx-auto h-9 w-72" />
            <Skeleton className="mx-auto mt-4 h-4 w-80" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((_, index) => (
              <Card key={index}>
                <CardHeader className="space-y-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Skeleton className="mx-auto h-9 w-72" />
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {STEPS.map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
                <Skeleton className="mx-auto h-5 w-36" />
                <Skeleton className="mx-auto mt-2 h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Skeleton className="mx-auto h-9 w-80" />
            <Skeleton className="mx-auto mt-4 h-4 w-72" />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {TESTIMONIALS.map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((__, starIndex) => (
                      <Skeleton key={starIndex} className="h-5 w-5 rounded" />
                    ))}
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <div className="container">
          <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-80" />
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Skeleton className="h-12 w-44" />
              <Skeleton className="h-12 w-44" />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-gray-50 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex gap-6 text-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </footer>
    </div>
  )
}
