import { cn } from '@/lib/utils'
import { LogoIcon } from '@/components/logo'
import { DocumentIllustation } from "@/components/document-illustration"

export const InvoiceIllustration = ({ className }: { className?: string }) => {
    return (
        <div
            aria-hidden
            className="relative">
            <div className={cn('mask-b-from-65% before:bg-background before:border-border after:border-border after:bg-background/50 before:z-1 group relative -mx-4 px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-2xl before:border after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-2xl after:border', className)}>
                <div className="bg-illustration ring-border-illustration relative z-10 overflow-hidden rounded-2xl border border-transparent p-8 text-sm shadow-xl shadow-black/10 ring-1">
                    <div className="mb-6 flex items-start justify-between">
                        <div className="space-y-0.5">
                            <LogoIcon />
                            <div className="mt-4 font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">Automatisert serie</div>
                            <div className="mt-1 -translate-x-1 font-mono text-2xl font-semibold">Påminnelse + premie</div>
                            <div className="text-xs font-medium">Sendes automatisk kl. 08:00</div>
                        </div>
                        <DocumentIllustation />
                    </div>

                    <div className="space-y-1.5 [--color-border:color-mix(in_oklab,var(--color-foreground)10%,transparent)]">
                        <div className="grid grid-cols-[auto_1fr] items-center">
                            <span className="text-muted-foreground w-18 block">Målgruppe</span>
                            <span className="bg-border h-2 w-1/4 rounded-full px-2" />
                        </div>

                        <div className="grid grid-cols-[auto_1fr] items-center">
                            <span className="text-muted-foreground w-18 block">Kanaler</span>
                            <span className="bg-border h-2 w-1/2 rounded-full px-2" />
                        </div>

                        <div className="grid grid-cols-[auto_1fr] items-center">
                            <span className="text-muted-foreground w-18 block">Premielogistikk</span>
                            <span className="bg-border h-2 w-2/3 rounded-full px-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
