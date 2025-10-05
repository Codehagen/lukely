import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCalendar, IconGift, IconUsers, IconTrophy, IconCheck, IconSparkles, IconChartBar } from "@tabler/icons-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 sm:py-32">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">
              <IconSparkles className="mr-2 h-3 w-3" />
              Bygg e-postlisten din med interaktive konkurranser
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gjør høytidene til magneter for leads
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Lag interaktive adventskalendere, nedtellinger og daglige konkurranser som fanger leads og skaper engasjement. Perfekt for netthandelsmerker, byråer og markedsførere.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8">
                  Start gratis prøveperiode
                </Button>
              </Link>
              <Link href="/dashboard/calendars">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Se demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ingen kredittkort nødvendig • 14 dagers gratis prøve
            </p>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950),theme(colors.gray.950))] opacity-20" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Alt du trenger for å kjøre virale konkurransekampanjer
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Kraftige funksjoner laget for vekstmarkedsførere og netthandelsmerker
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <IconCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Ferdiglagde maler</CardTitle>
                <CardDescription>
                  Start på minutter med klare maler for jul, valentinsdagen, påske og egne kampanjer
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <IconGift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Daglige konkurranser</CardTitle>
                <CardDescription>
                  Legg til produkter bak hver luke og håndter deltakere, vinnere og premieutdeling automatisk
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <IconUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Skjema for lead-innsamling</CardTitle>
                <CardDescription>
                  Samle inn e-post, navn og telefonnummer med tilpassbare skjemaer. Eksporter til CRM-et ditt når som helst
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                  <IconTrophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle>Tilfeldig vinnerutvelgelse</CardTitle>
                <CardDescription>
                  Rettferdig og transparent vinneruttrekning med ett klikk. Automatiske varsler holder vinnerne engasjert
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                  <IconSparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Tilpasning til merkevaren</CardTitle>
                <CardDescription>
                  Full white-label med egne farger, logoer og domene. Passer perfekt til profilen din
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <IconChartBar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Analyse og innsikt</CardTitle>
                <CardDescription>
                  Følg engasjement, konverteringsrater og kampanjeresultater i detaljerte dashbord
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lanser kampanjen din i 3 enkle steg
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Velg mal</h3>
              <p className="text-muted-foreground">
                Velg blant julekalender, valentinsnedtelling eller lag din egen kalender
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Legg til produkter</h3>
              <p className="text-muted-foreground">
                Last opp konkurransepremiene dine med bilder, beskrivelser og verdier bak hver luke
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Gå live</h3>
              <p className="text-muted-foreground">
                Del kalenderlenken og se leadsene strømme inn. Eksporter data til favorittverktøyene dine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Pålitelig for voksende merkevarer
              </h2>
              <p className="text-lg text-muted-foreground">
                Bli med hundrevis av bedrifter som bruker interaktive kalendere for å vokse publikumet sitt
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconCheck key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Vi hentet inn over 5 000 leads med julekalenderen vår. Plattformen betalte seg tilbake ti ganger."
                  </p>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Markedssjef, BeautyBrand</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconCheck key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Det tok under 30 minutter å komme i gang. Engasjementet var ti ganger høyere enn i tradisjonelle e-postkampanjer."
                  </p>
                  <p className="font-semibold">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">Daglig leder, GiftShop Co.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Klar for å vokse e-postlisten din?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Start din 14 dagers gratis prøve i dag. Ingen kredittkort nødvendig.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Kom i gang gratis
                </Button>
              </Link>
              <Link href="/dashboard/calendars">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                  Se live demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <IconCalendar className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-lg">Calendar Lead Magnets</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Personvernerklæring</Link>
              <Link href="#" className="hover:text-foreground">Vilkår for bruk</Link>
              <Link href="#" className="hover:text-foreground">Kontakt</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Calendar Lead Magnets. Alle rettigheter forbeholdt.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
