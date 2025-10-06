'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Hvor raskt kan vi lansere en Lukely-kampanje?',
            answer: 'De fleste team går live i løpet av få dager. Velg en mal, legg inn premier og innhold, og bruk forhåndsvisningen vår for godkjenning før publisering. Trenger du hjelp? Onboarding-teamet støtter med tekst, design og integrasjoner.',
        },
        {
            id: 'item-2',
            question: 'Er Lukely i samsvar med GDPR og andre personvernregler?',
            answer: 'Ja. Lukely har samtykkebokser, double opt-in, IP-filtrering, alderssperrer og komplette revisjonslogger. Du kan eksportere samtykkedata når som helst eller synkronisere dem automatisk til markedsføringsverktøyene dine.',
        },
        {
            id: 'item-3',
            question: 'Kan vi bruke vårt eget design og domene?',
            answer: 'Selvsagt. Last opp egne fonter, farger og animasjoner, og vis kalenderen på eget domene eller direkte i CMS-et. Byråer kan klone kampanjer for flere merkevarer og holde ressursene ryddige.',
        },
        {
            id: 'item-4',
            question: 'Hvilke verktøy integreres Lukely med?',
            answer: 'Koble Lukely til HubSpot, Mailchimp, Klaviyo, Salesforce, Zapier, Meta Ads, Google Analytics og flere. REST-API-et og webhookene lar deg sende hendelser til alle interne systemer i sanntid.',
        },
        {
            id: 'item-5',
            question: 'Hvilken støtte er inkludert?',
            answer: 'Alle planer inkluderer live chat og e-poststøtte, onboarding-ressurser og kampanjesjekklister. Enterprise-kunder kan legge til flerspråklig support, tilpassede SLA-er og driftede tjenester.',
        },
    ]

    return (
        <section className="relative border-t border-foreground/10 bg-muted/50">
            <div className="mx-auto max-w-6xl border-x border-foreground/10 px-4 py-16 md:px-6 md:py-24">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Ofte spurt om Lukely</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Få detaljene om å lansere sesongkampanjer, samle inn samtykker og koble Lukely til verktøyene dere bruker fra før.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Finner du ikke det du leter etter? Ta kontakt med vårt{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            kundesuksessteam
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
