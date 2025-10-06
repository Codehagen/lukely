'use client'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import NumberFlow from '@number-flow/react'

export default function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually')
    const annualReduction = 0.75

    const price = {
        monthly: 349,
        annually: 349 * annualReduction,
    }

    const features = ['Ubegrensede deltakere og trafikk', 'Over 20 språkmaler med lokal tilpasning', 'GDPR-vennlig samtykkeinnhenting', 'Automatiserte e-post- og SMS-påminnelser', 'Umiddelbar trekning av vinnere med revisjonsspor', 'Eksporter leads til HubSpot, Klaviyo, Mailchimp', 'Dashbord for konverteringsanalyse i sanntid', 'Prioritert støtte på chat og e-post']

    return (
        <section className="relative border-t border-foreground/10 bg-muted/50">
            <div className="@container relative mx-auto max-w-6xl border-x border-foreground/10 px-6 py-24 md:py-32">
                <div className="mx-auto max-w-5xl">
                    <div className="mx-auto max-w-lg text-center">
                        <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl lg:tracking-tight">Én plan for sesongkampanjer som konverterer</h2>
                        <p className="text-muted-foreground mt-8 text-balance text-lg lg:text-xl">Lanser en merkevaretilpasset høytidsopplevelse, samle kvalifiserte leads og plei dem automatisk – uten skjulte kostnader.</p>

                        <div className="my-8">
                            <div
                                data-period={billingPeriod}
                                className="bg-foreground/5 *:text-foreground/75 relative mx-auto grid w-fit grid-cols-2 rounded-full p-1 *:block *:h-8 *:w-24 *:rounded-full *:text-sm *:hover:opacity-75">
                                <div
                                    aria-hidden
                                    className="bg-card in-data-[period=monthly]:translate-x-0 ring-foreground/5 pointer-events-none absolute inset-1 w-1/2 translate-x-full rounded-full border border-transparent shadow ring-1 transition-transform duration-500 ease-in-out"
                                />
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    {...(billingPeriod === 'monthly' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Månedlig
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('annually')}
                                    {...(billingPeriod === 'annually' && { 'data-active': true })}
                                    className="data-active:text-foreground data-active:font-medium relative">
                                    Årlig
                                </button>
                            </div>
                            <div className="mt-3 text-xs">
                                <span className="text-primary font-medium">Spar 25 %</span> med årlig fakturering
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto max-w-md space-y-8">
                        <div className="ring-foreground/10 bg-card @lg:p-10 space-y-6 rounded-2xl border-transparent p-8 text-center shadow shadow-xl ring-1">
                            <div>
                                <CardTitle className="text-lg font-medium">Julevekstpakken</CardTitle>
                                <CardDescription className="text-muted-foreground mx-auto mt-1 max-w-xs text-balance text-sm">Alt du trenger for å designe, lansere og skalere Lukely-kampanjen din.</CardDescription>
                            </div>
                            <div className="mx-auto grid w-fit grid-cols-[auto_1fr] items-center gap-3">
                                <NumberFlow
                                    value={price[billingPeriod]}
                                    format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                                    className="text-5xl font-semibold"
                                />
                                <div className="text-left">
                                    <span className="text-sm">Per måned</span>
                                    <div className="text-muted-foreground text-xs">Faktureres {billingPeriod === 'monthly' ? 'månedlig' : 'årlig'}</div>
                                </div>
                            </div>
                            <Button asChild>
                                <Link href="#">Start med Lukely</Link>
                            </Button>
                            <div
                                aria-hidden
                                className="mx-16 h-px bg-[length:6px_1px] bg-repeat-x opacity-25 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)]"
                            />
                            <CardDescription className="text-muted-foreground mx-auto mt-1 max-w-xs text-balance text-sm">Ingen skjulte kostnader. Avslutt når som helst. Fakturaer klare for enkel viderefakturering.</CardDescription>
                        </div>

                        <ul
                            role="list"
                            className="@md:grid-cols-2 grid gap-4 text-sm">
                            {features.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2">
                                    <Check
                                        className="text-muted-foreground size-3"
                                        strokeWidth={3.5}
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
