'use client'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import NumberFlow from '@number-flow/react'

const planCopy = {
    single: {
        name: 'Enkeltkalender',
        description: 'Perfekt når du vil lansere én julekalender eller en enkelt sesongkampanje.',
        helper: 'Engangspris for én kalender',
        cta: 'Bestill enkeltkalender',
        label: 'Én kampanje',
    },
    year: {
        name: 'Årspakke',
        description: 'Planlegg flere kampanjer i løpet av året – fra jul og vinterferie til påske og sommer.',
        helper: 'Fast pris for 12 måneder med kalendere',
        cta: 'Snakk med oss om årsplan',
        label: 'Hele året',
    },
} as const

const price = {
    single: 10000,
    year: 15000,
} as const

const features = ['Tilgang til alle maler og 20+ språk', 'Automatiserte e-post- og SMS-påminnelser', 'Rapporter, eksport av samtykker og revisjonsspor', 'Integrasjoner mot CRM, e-post og annonseplattformer', 'Dashbord for sanntidsanalyse og engasjement', 'Prioritert support fra Lukelys kampanjeteam']

export default function Pricing() {
    const [selectedPlan, setSelectedPlan] = useState<'single' | 'year'>('year')

    return (
        <section className="relative border-t border-foreground/10 bg-muted/50">
            <div className="@container relative mx-auto max-w-6xl border-x border-foreground/10 px-6 py-24 md:py-32">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl lg:tracking-tight">Én kalender eller kampanjer hele året</h2>
                        <p className="text-muted-foreground mt-8 text-balance text-lg lg:text-xl">Velg mellom en enkel sesonglansering eller en årsavtale med ubegrensede Lukely-kampanjer – du kan alltid oppgradere.</p>

                        <div className="my-8">
                            <div
                                data-plan={selectedPlan}
                                className="bg-foreground/5 *:text-foreground/75 relative mx-auto grid w-fit grid-cols-2 rounded-full p-1 *:block *:h-8 *:w-32 *:rounded-full *:text-sm *:hover:opacity-75">
                                <div
                                    aria-hidden
                                    className="bg-card in-data-[plan=single]:translate-x-0 ring-foreground/5 pointer-events-none absolute inset-1 w-1/2 translate-x-full rounded-full border border-transparent shadow ring-1 transition-transform duration-500 ease-in-out"
                                />
                                <button
                                    onClick={() => setSelectedPlan('single')}
                                    {...(selectedPlan === 'single' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Én kalender
                                </button>
                                <button
                                    onClick={() => setSelectedPlan('year')}
                                    {...(selectedPlan === 'year' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Årspakke
                                </button>
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                                {planCopy[selectedPlan].helper}
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto max-w-md space-y-8">
                        <div className="ring-foreground/10 bg-card @lg:p-10 space-y-6 rounded-2xl border-transparent p-8 text-center shadow shadow-xl ring-1">
                            <div>
                                <CardTitle className="text-lg font-medium">{planCopy[selectedPlan].name}</CardTitle>
                                <CardDescription className="text-muted-foreground mx-auto mt-1 max-w-xs text-balance text-sm">
                                    {planCopy[selectedPlan].description}
                                </CardDescription>
                            </div>
                            <div className="mx-auto grid w-fit grid-cols-[auto_1fr] items-center gap-3">
                                <NumberFlow
                                    value={price[selectedPlan]}
                                    format={{ style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }}
                                    className="text-5xl font-semibold"
                                />
                                <div className="text-left">
                                    <span className="text-sm">{planCopy[selectedPlan].label}</span>
                                    <div className="text-muted-foreground text-xs">Fakturert én gang</div>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="#">{planCopy[selectedPlan].cta}</Link>
                            </Button>
                            <div
                                aria-hidden
                                className="mx-16 h-px bg-[length:6px_1px] bg-repeat-x opacity-25 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)]"
                            />
                            <CardDescription className="text-muted-foreground mx-auto mt-1 max-w-xs text-balance text-sm">
                                Inkluderer onboarding, kampanjeguide og support når du trenger oss.
                            </CardDescription>
                        </div>

                        <ul
                            role="list"
                            className="@md:grid-cols-2 grid gap-4 text-sm">
                            {features.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-2">
                                    <Check
                                        className="text-primary size-4"
                                        strokeWidth={3}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
