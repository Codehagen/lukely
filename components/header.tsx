import { Suspense } from 'react'
import HeaderClient, { type HeaderUser } from './header-client'
import { getCurrentUser } from '@/app/actions/user'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/logo'

async function HeaderWithUser() {
    const user = await getCurrentUser()

    const headerUser: HeaderUser | null = user
        ? {
              id: user.id,
              name: user.name,
              email: user.email,
          }
        : null

    return <HeaderClient user={headerUser} />
}

function HeaderSkeleton() {
    return (
        <header className="fixed inset-x-0 top-0 z-50 border-transparent">
            <div className="border-foreground/5 absolute inset-x-0 top-0 z-50 bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:h-20 lg:px-12">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="hidden items-center gap-6 md:flex">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="hidden items-center gap-3 md:flex">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                    <Skeleton className="size-10 rounded-md md:hidden" />
                </div>
            </div>
        </header>
    )
}

export default function Header() {
    return (
        <Suspense fallback={<HeaderSkeleton />}>
            <HeaderWithUser />
        </Suspense>
    )
}

export { HeaderSkeleton }
