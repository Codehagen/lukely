import { Button } from '@/components/ui/button'
import { DocumentIllustation } from "@/components/document-illustration"
import { CurrencyIllustration } from "@/components/currency-illustration"
import { ArrowBigRight } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksSection() {
    return (
        <section className="relative overflow-hidden border-t border-foreground/10 bg-muted/50">
            <div className="@container relative mx-auto w-full max-w-6xl border-x border-foreground/10 px-6 py-24">
                <div className="bg-muted/60 rounded-[2rem] border border-foreground/10 px-6 py-16 sm:px-12 md:py-20">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-primary">Slik fungerer Lukely</span>
                        <h2 className="text-foreground mt-4 text-4xl font-semibold">Planlegg, lanser og skalér din interaktive kampanje</h2>
                        <p className="text-muted-foreground mt-4 text-balance text-lg">Gjør en sesongidé om til en inntektsdrivende opplevelse med en veiviser som holder teamet raskt, compliant og tro mot merkevaren.</p>
                    </div>

                    <div className="@3xl:grid-cols-3 my-20 grid gap-12">
                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">1</span>
                                <div className="relative">
                                    <div className="mx-auto my-6 w-fit">
                                        <DocumentIllustation />
                                    </div>
                                    <ArrowBigRight className="@3xl:block fill-background stroke-background absolute inset-y-0 right-0 my-auto hidden translate-x-[150%] drop-shadow" />
                                </div>
                                <h3 className="text-foreground mb-4 text-lg font-semibold">Design kalenderen</h3>
                                <p className="text-muted-foreground text-balance">Velg en mal, lokaliser hver luke og legg til premier, quizer eller kampanjer med drag-and-drop-editoren.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">2</span>
                                <div className="relative">
                                    <div className="mx-auto my-6 w-fit">
                                        <CurrencyIllustration />
                                    </div>
                                    <ArrowBigRight className="@3xl:block fill-background stroke-background absolute inset-y-0 right-0 my-auto hidden translate-x-[150%] drop-shadow" />
                                </div>
                                <h3 className="text-foreground mb-4 text-lg font-semibold">Markedsfør og engasjer</h3>
                                <p className="text-muted-foreground text-balance">Bygg den inn på nettsiden, kjør betalte og organiske kampanjer og automatiser daglige påminnelser som får publikum tilbake.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-zinc-500/15 text-sm font-medium text-zinc-700">3</span>
                                <div className="mx-auto my-6 flex w-fit gap-2">
                                    <DocumentIllustation />
                                    <DocumentIllustation />
                                </div>
                                <h3 className="text-foreground mb-4 text-lg font-semibold">Konverter og rapporter</h3>
                                <p className="text-muted-foreground text-balance">Synkroniser leads til CRM-et, følg konverteringer i sanntid og optimaliser neste års kampanje med detaljerte innsikter.</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        className="mx-auto flex w-fit">
                        <Link href="/sign-up">Book en Lukely-demo</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
