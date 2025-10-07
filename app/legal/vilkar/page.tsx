import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function VilkarPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <Card className="p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-6">Vilkår for bruk av Lukely</h1>

        <div className="prose prose-sm md:prose-base max-w-none space-y-6">
          <p className="text-muted-foreground">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <p>
              Disse vilkårene gjelder for bruk av Lukely, en plattform levert av Codebase AS for å opprette og
              administrere interaktive julekalendere og sesongkampanjer med lead-generering og premietrekning.
            </p>
            <p>
              Ved å opprette en konto og ta i bruk Lukely, aksepterer du å være bundet av disse vilkårene.
              Mislighold av vilkårene kan medføre at vi stenger din tilgang til plattformen.
            </p>
            <p>
              Spørsmål om bruksvilkårene kan sendes til support@codebase.no
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Definisjoner</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Codebase AS / Vi / Oss:</strong> Leverandør av Lukely-plattformen, org.nr. [organisasjonsnummer]
              </li>
              <li>
                <strong>Lukely / Plattformen / Tjenesten:</strong> Den nettbaserte plattformen for å opprette og
                administrere interaktive kalendre, inkludert alle tilhørende funksjoner og tjenester
              </li>
              <li>
                <strong>Kunden / Du:</strong> Foretaket (organisasjon med org.nr.) som registrerer seg for å bruke Lukely
              </li>
              <li>
                <strong>Workspace:</strong> Kundens arbeidsplass i plattformen hvor kalendre administreres
              </li>
              <li>
                <strong>Kalender:</strong> En interaktiv julekalender, valentinskalender, påskekalender eller tilpasset
                kampanje opprettet i plattformen
              </li>
              <li>
                <strong>Deltaker / Mottaker:</strong> Sluttbruker som deltar i en kalender opprettet av Kunden
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Kundens plikter og ansvar</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Registrering og konto</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kunden må være et registrert foretak med gyldig organisasjonsnummer</li>
              <li>Du må oppgi korrekte og fullstendige opplysninger ved registrering</li>
              <li>Den som oppretter kontoen må være over 18 år og ha fullmakt til å inngå avtaler på vegne av foretaket</li>
              <li>Automatisert registrering ved hjelp av "bots" eller andre automatiserte metoder er ikke tillatt</li>
              <li>Du er ansvarlig for å holde påloggingsinformasjon hemmelig og sikker</li>
              <li>Du er ansvarlig for all aktivitet som skjer under din konto</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Bruk av tjenesten</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tjenesten kan kun benyttes av det foretaket som er registrert som Kunde</li>
              <li>Du kan ikke viderelisensiere, selge eller leie ut tilgangen til Lukely til andre foretak eller personer</li>
              <li>Du er ansvarlig for at alt innhold du publiserer (tekst, bilder, premier, quiz-spørsmål) er lovlig,
                anstendig og ikke krenker andres rettigheter</li>
              <li>Du må ha nødvendige rettigheter til alle bilder, logoer og annet innhold du laster opp</li>
              <li>Du er ansvarlig for å følge gjeldende lover og regler, inkludert GDPR, markedsføringsloven og
                konkurranseloven</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Personvern og GDPR</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Du er behandlingsansvarlig for personopplysninger om dine deltakere</li>
              <li>Du må ha gyldig behandlingsgrunnlag (samtykke) fra deltakere før du samler inn deres opplysninger</li>
              <li>Du må respektere deltakeres rettigheter i henhold til GDPR (innsyn, sletting, retting, etc.)</li>
              <li>Du må ha en gyldig personvernerklæring og vilkår for dine kalendre</li>
              <li>Du er ansvarlig for å håndtere henvendelser fra deltakere om deres personopplysninger</li>
              <li>Vi er databehandler for personopplysninger du lagrer i plattformen. Se{' '}
                <Link href="/legal/personvern" className="text-blue-600 hover:underline">personvernerklæringen</Link> for detaljer
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Premier og trekning</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Du er ansvarlig for å anskaffe, levere og følge opp alle premier du tilbyr i dine kalendre</li>
              <li>Du må gjennomføre premietrekninger på en rettferdig og transparent måte</li>
              <li>Du må kontakte vinnere og sørge for at premier blir utlevert som lovet</li>
              <li>Du er ansvarlig for eventuelle skatter, avgifter eller juridiske forpliktelser knyttet til
                premietrekninger i din jurisdiksjon</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.5 Forbudt bruk</h3>
            <p>Du er ikke tillatt å bruke plattformen til å:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sende spam eller uønsket kommunikasjon</li>
              <li>Publisere ulovlig, truende, sjikanerende, ærekrenkende, pornografisk eller upassende innhold</li>
              <li>Krenke andres immaterielle rettigheter (opphavsrett, varemerker, etc.)</li>
              <li>Samle inn personopplysninger uten gyldig samtykke</li>
              <li>Distribuere skadelig programvare eller utføre cyberangrep</li>
              <li>Omgå sikkerhetstiltak eller få uautorisert tilgang til systemet</li>
              <li>Forfalske identitet eller villede deltakere</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Abonnement og betaling</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Abonnementstyper</h3>
            <p>
              Lukely tilbys i ulike abonnementsplaner med forskjellige funksjoner, lagringskapasitet og antall
              tillatte kalendre. Detaljer om prisplaner finner du på vår nettside.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Betaling</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Abonnement forhåndsbetales for en periode på 1 måned eller 12 måneder (årlig)</li>
              <li>Alle priser er oppgitt eksklusiv merverdiavgift (mva)</li>
              <li>Faktura sendes elektronisk til registrert e-postadresse</li>
              <li>Betaling forfaller i henhold til betalingsbetingelsene på fakturaen</li>
              <li>Ved forsinket betaling forbeholder vi oss retten til å suspendere tilgangen til kontoen</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Fornyelse og oppsigelse</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Månedlige abonnement fornyes automatisk hver måned med mindre de blir sagt opp</li>
              <li>Årlige abonnement fornyes automatisk etter 12 måneder med mindre de blir sagt opp</li>
              <li>Du kan si opp abonnementet når som helst, men oppsigelsen trer i kraft ved utløpet av gjeldende periode</li>
              <li>Ved oppsigelse eller nedgradering i løpet av en betalt periode, gis det ikke refusjon for gjenværende tid</li>
              <li>Ved oppgradering i løpet av en periode, godskrives du for gjenværende tid av forrige periode,
                og ny periode starter med samme lengde</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Gratis prøveperiode</h3>
            <p>
              Hvis det tilbys en gratis prøveperiode, kan du teste plattformen uten kostnad i den angitte perioden.
              Prøveperioden avsluttes automatisk med mindre du velger å tegne et betalt abonnement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Vårt ansvar og garantier</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Tilgjengelighet</h3>
            <p>
              Vi streber etter å holde plattformen tilgjengelig 24/7, men kan ikke garantere 100% oppetid.
              Planlagt vedlikehold vil varsles i forkant når det er mulig. Vi er ikke ansvarlige for driftsforstyrrelser
              forårsaket av omstendigheter utenfor vår kontroll.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Tjenesten leveres "som den er"</h3>
            <p>
              Lukely leveres "som den er" (as-is) uten garantier av noe slag, verken uttrykkelige eller underforståtte.
              Vi garanterer ikke at tjenesten vil være feilfri, sikker eller alltid tilgjengelig.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Ansvarsbegrensning</h3>
            <p>
              Codebase AS kan ikke holdes erstatningsansvarlig for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirekte tap, tapt fortjeneste, tap av data eller annet følgetap</li>
              <li>Tap som følge av mislighold fra Kundens side</li>
              <li>Tap som følge av forhold utenfor vår kontroll (force majeure)</li>
              <li>Innhold publisert av Kunden eller deltakere</li>
              <li>Kundens mislighold av personvernlovgivning eller andre lover</li>
            </ul>
            <p className="mt-4">
              Ved direkte tap som skyldes feil ved tjenesten, er vårt ansvar begrenset til å tilbakeføre
              vederlaget for den gjenværende tiden av Kundens abonnement, maksimalt begrenset til det Kunden
              har betalt for de siste 12 månedene.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Skadesløsholdelse</h3>
            <p>
              Kunden skal holde Codebase AS skadesløs for alle krav fra deltakere, tredjeparter eller offentlige
              myndigheter som skyldes Kundens bruk av plattformen, inkludert brudd på personvernlovgivning,
              konkurranseloven, markedsføringsloven eller andre lover og regler.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Immaterielle rettigheter</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Våre rettigheter</h3>
            <p>
              Codebase AS eier alle rettigheter til Lukely-plattformen, inkludert kildekode, design, varemerker
              og annet åndsverk. Du får kun en begrenset, ikke-eksklusiv rett til å bruke plattformen i henhold
              til disse vilkårene.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Ditt innhold</h3>
            <p>
              Du beholder alle rettigheter til innhold du laster opp til plattformen (tekst, bilder, logoer).
              Ved å laste opp innhold gir du oss en begrenset lisens til å lagre, vise og behandle innholdet
              som nødvendig for å levere tjenesten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Databehandling og lagring</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Databehandleravtale</h3>
            <p>
              For personopplysninger om deltakere som lagres i plattformen er du behandlingsansvarlig og vi er
              databehandler. Databehandleravtalen er tilgjengelig i plattformen og regulerer vår behandling av
              disse opplysningene.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Sikkerhet</h3>
            <p>
              Vi implementerer passende tekniske og organisatoriske sikkerhetstiltak for å beskytte data lagret
              i plattformen. Se{' '}
              <Link href="/legal/personvern" className="text-blue-600 hover:underline">personvernerklæringen</Link>{' '}
              for detaljer.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Backup og datatap</h3>
            <p>
              Vi tar regelmessige sikkerhetskopier av data. Likevel er vi ikke ansvarlige for datatap, og du
              bør ta egne sikkerhetskopier av kritiske data (f.eks. eksportere deltakerlister regelmessig).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.4 Sletting av data</h3>
            <p>
              Ved stenging av konto vil alle data bli slettet permanent etter 30 dager. Dette inkluderer
              kalendre, deltakeropplysninger, statistikk og annet innhold. En slettet konto kan ikke gjenopprettes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Endringer og oppsigelse</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Endringer i tjenesten</h3>
            <p>
              Vi forbeholder oss retten til å endre, legge til eller fjerne funksjoner i plattformen.
              Vesentlige endringer som påvirker eksisterende funksjonalitet vil varsles i forkant.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Endringer i vilkår</h3>
            <p>
              Vi kan oppdatere disse vilkårene fra tid til annen. Ved vesentlige endringer vil vi varsle deg
              via e-post eller en merknad i plattformen. Fortsatt bruk etter varsling innebærer aksept av
              de nye vilkårene.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Oppsigelse fra vår side</h3>
            <p>
              Vi kan si opp avtalen med 3 måneders varsel. Ved mislighold av vilkårene (inkludert ulovlig
              eller upassende bruk, manglende betaling, eller brudd på personvernregler) kan vi suspendere
              eller avslutte din tilgang umiddelbart uten forvarsel.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.4 Konsekvenser av oppsigelse</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Din tilgang til plattformen opphører</li>
              <li>Alle aktive kalendre blir utilgjengelige for deltakere</li>
              <li>Data slettes permanent etter 30 dager (med mindre annet er avtalt)</li>
              <li>Du er fortsatt ansvarlig for å oppfylle forpliktelser overfor deltakere (f.eks. levere premier)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Diverse bestemmelser</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Helhetlig avtale</h3>
            <p>
              Disse vilkårene, sammen med personvernerklæringen og databehandleravtalen, utgjør hele avtalen
              mellom deg og Codebase AS angående bruk av Lukely.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Overdragelse</h3>
            <p>
              Du kan ikke overdra eller overføre dine rettigheter eller plikter under denne avtalen uten vårt
              skriftlige samtykke. Vi kan overdra avtalen til et annet selskap i forbindelse med sammenslåing,
              oppkjøp eller omorganisering.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.3 Gjeldende lov og verneting</h3>
            <p>
              Denne avtalen reguleres av norsk rett. Eventuelle tvister skal søkes løst i minnelighet, men
              kan bringes inn for Oslo tingrett som verneting.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.4 Separabilitet</h3>
            <p>
              Dersom en bestemmelse i disse vilkårene skulle anses ugyldig eller ikke kunne håndheves, skal
              de øvrige bestemmelsene fortsatt gjelde i sin helhet.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">8.5 Forbehold om rettigheter</h3>
            <p>
              Dersom vi ikke gjør gjeldende en rett eller bestemmelse i disse vilkårene, skal dette ikke
              tolkes som et frafall av den retten eller bestemmelsen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Kontaktinformasjon</h2>
            <p>
              For spørsmål om disse vilkårene eller bruk av Lukely, vennligst kontakt oss:
            </p>
            <p className="mt-2">
              <strong>Codebase AS</strong><br />
              E-post: support@codebase.no<br />
              Org.nr: [organisasjonsnummer]
            </p>
          </section>

          <div className="mt-12 pt-8 border-t">
            <Link
              href="/legal/personvern"
              className="text-blue-600 hover:underline font-medium"
            >
              Les vår personvernerklæring →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
