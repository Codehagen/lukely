import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function PersonvernPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <Card className="p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-6">Personvernerklæring</h1>

        <div className="prose prose-sm md:prose-base max-w-none space-y-6">
          <p className="text-muted-foreground">
            Sist oppdatert: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <p>
              Lukely tilbyr en plattform for å lage interaktive julekalendere og sesongkampanjer med lead-generering.
              For å kunne gi deg best mulig opplevelse og følge opp dine henvendelser, samler vi inn og behandler personopplysninger.
              Ved siden av de opplysningene du selv velger å oppgi, samles det inn en begrenset mengde opplysninger ved bruk av plattformen.
            </p>
            <p>
              Denne personvernerklæringen forteller hvordan Codebase AS samler inn og bruker personopplysninger på vår plattform Lukely.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Behandlingsansvarlig</h2>
            <p>
              Codebase AS, org.nr. [organisasjonsnummer], er behandlingsansvarlig for personopplysninger som behandles gjennom Lukely-plattformen.
            </p>
            <p>
              Kontaktinformasjon:<br />
              E-post: support@codebase.no
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Hvilke opplysninger behandles</h2>
            <p>Vi behandler følgende typer personopplysninger:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Kontoinformasjon:</strong> Navn, e-postadresse, telefonnummer, profilbilde (valgfritt)
              </li>
              <li>
                <strong>Arbeidsplassinformasjon:</strong> Firmanavn, organisasjonsnummer, stillingstittel
              </li>
              <li>
                <strong>Deltakeropplysninger:</strong> Navn, e-post, telefon og samtykker fra personer som deltar i kalendre opprettet av våre kunder
              </li>
              <li>
                <strong>Aktivitetsdata:</strong> Informasjon om hvilke kalendre og luker du besøker, tidspunkt for besøk, interaksjoner
              </li>
              <li>
                <strong>Quiz-svar:</strong> Svar på spørsmål i forbindelse med deltakelse i kalendere
              </li>
              <li>
                <strong>Teknisk informasjon:</strong> IP-adresse, nettlesertype, enhetstype, operativsystem
              </li>
              <li>
                <strong>Betalingsinformasjon:</strong> Behandles av vår betalingsleverandør og lagres ikke direkte hos oss
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Behandlingsgrunnlag</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Samtykke:</strong> Vi behandler de opplysninger du deler med oss basert på ditt samtykke der dette er påkrevd,
                særlig for markedsføring og nyhetsbrev.
              </li>
              <li>
                <strong>Avtale:</strong> Vi behandler opplysninger når de inngår som en del av en avtale eller som del av dialog
                forut for en eventuell avtale (kundeforhold, abonnement).
              </li>
              <li>
                <strong>Interesseavveining:</strong> Vi behandler enkelte opplysninger basert på en interesseavveining,
                for eksempel for å forbedre tjenesten og gi deg relevant informasjon.
              </li>
              <li>
                <strong>Lovpålagt behandling:</strong> Enkelte opplysninger er vi pålagt å behandle ved lov,
                for eksempel i forbindelse med kjøp av produkter og tjenester (regnskapsloven).
              </li>
            </ul>
            <p className="mt-4">
              Du kan når som helst trekke tilbake ditt samtykke. Behandlingen av de aktuelle personopplysningene vil da opphøre,
              med mindre vi har et annet gyldig behandlingsgrunnlag.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Formål med behandlingen</h2>
            <p>Vi behandler personopplysninger for følgende formål:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Administrere din konto og gi deg tilgang til plattformen</li>
              <li>Levere og forbedre våre tjenester</li>
              <li>Kommunisere med deg om din konto, abonnement og tjenester</li>
              <li>Behandle betalinger og fakturering</li>
              <li>Gi kundestøtte og svare på henvendelser</li>
              <li>Analysere bruk av plattformen for å forbedre funksjonalitet og brukeropplevelse</li>
              <li>Sende deg markedsføring og nyhetsbrev (kun med samtykke)</li>
              <li>Oppfylle juridiske forpliktelser</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Deling av personopplysninger</h2>
            <p>Vi deler ikke dine personopplysninger med tredjeparter, med følgende unntak:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Databehandlere:</strong> Vi benytter pålitelige tredjeparts tjenesteleverandører som databehandlere
                (f.eks. skylagring, betalingstjenester, analyseverktøy). Disse har kun tilgang til opplysninger som er
                nødvendig for å utføre sine tjenester på våre vegne.
              </li>
              <li>
                <strong>Juridiske krav:</strong> Vi kan dele opplysninger når det er nødvendig for å overholde lov,
                rettskjennelser eller offentlige myndigheters forespørsler.
              </li>
              <li>
                <strong>Forretningsoverføring:</strong> Ved sammenslåing, oppkjøp eller salg av virksomhet kan personopplysninger
                overføres som en del av transaksjonen.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Viktig for kalenderdeltakere:</strong> Når du deltar i en kalender opprettet av en av våre kunder,
              deles dine personopplysninger (navn, e-post, telefon, quiz-svar) med den kunden. Kunden er selvstendig
              behandlingsansvarlig for disse opplysningene.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Lagring og sletting</h2>
            <p>
              Vi lagrer personopplysninger bare så lenge det er nødvendig for å oppfylle formålene beskrevet i denne
              personvernerklæringen, eller så lenge det er påkrevd ved lov.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Kontoopplysninger:</strong> Lagres så lenge du har en aktiv konto, og i inntil 90 dager etter
                stenging av konto (for eventuelle oppfølgingsbehov).
              </li>
              <li>
                <strong>Regnskapsdata:</strong> Oppbevares i henhold til regnskapsloven (minimum 5 år).
              </li>
              <li>
                <strong>Deltakeropplysninger:</strong> Lagres i henhold til kalendereierens retningslinjer,
                eller til du ber om sletting.
              </li>
              <li>
                <strong>Markedsføringsdata:</strong> Slettes når du trekker tilbake samtykke,
                men e-postadressen kan beholdes for å sikre at du ikke mottar mer kommunikasjon.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Sikkerhet</h2>
            <p>
              Vi tar sikkerheten for dine personopplysninger på alvor og implementerer passende tekniske og
              organisatoriske tiltak for å beskytte opplysningene mot tap, misbruk og uautorisert tilgang. Dette inkluderer:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kryptering av data under overføring (HTTPS/TLS)</li>
              <li>Kryptering av sensitive data ved lagring</li>
              <li>Tilgangskontroll og autentisering</li>
              <li>Regelmessige sikkerhetsgjennomganger</li>
              <li>Begrenset tilgang for ansatte (kun de som trenger det for å utføre sine oppgaver)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Dine rettigheter</h2>
            <p>Du har følgende rettigheter i henhold til personvernlovgivningen:</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til innsyn</h3>
            <p>
              Du har rett til å få innsyn i personopplysningene vi behandler om deg. Du kan be om en kopi av
              opplysningene samt informasjon om formål, behandlingsgrunnlag, lagringstid og eventuelle mottakere.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til retting</h3>
            <p>
              Du har rett til å få rettet eller supplert personopplysninger om deg som er unøyaktige eller ufullstendige.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til sletting</h3>
            <p>Du har rett til å få slettet personopplysninger om deg i følgende tilfeller:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Opplysningene ikke lenger er nødvendige for formålet</li>
              <li>Du trekker tilbake samtykket</li>
              <li>Du motsetter deg behandlingen og det ikke foreligger overordnede legitime grunner</li>
              <li>Opplysningene er behandlet ulovlig</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til begrensning</h3>
            <p>
              I visse situasjoner kan du kreve at behandlingen av personopplysninger begrenses.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til dataportabilitet</h3>
            <p>
              Du har rett til å motta personopplysninger vi har lagret om deg i et strukturert, alminnelig anvendt og
              maskinlesbart format. Du kan også be om at vi overfører opplysningene til en annen behandlingsansvarlig
              dersom det er teknisk mulig.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til å protestere</h3>
            <p>
              Du har rett til å protestere mot behandling av personopplysninger som er basert på interesseavveining.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Rett til å klage</h3>
            <p>
              Dersom du mener at vår behandling av personopplysninger ikke er i samsvar med gjeldende regelverk,
              har du rett til å klage til Datatilsynet. Du kan lese mer på{' '}
              <a
                href="https://www.datatilsynet.no"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                www.datatilsynet.no
              </a>{' '}
              eller kontakte dem på Postboks 8177, 0034 Oslo.
            </p>

            <p className="mt-4">
              For å utøve dine rettigheter, vennligst kontakt oss på support@codebase.no.
              Vi vil svare på din henvendelse innen 30 dager.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Informasjonskapsler (cookies)</h2>
            <p>
              Vi bruker informasjonskapsler og lignende teknologier for å forbedre funksjonaliteten på plattformen,
              analysere bruk og huske dine preferanser. Du kan kontrollere bruken av informasjonskapsler gjennom
              nettleserinnstillingene dine.
            </p>
            <p className="mt-2">
              For mer informasjon om vårt bruk av cookies, se vår cookiepolicy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Endringer i personvernerklæringen</h2>
            <p>
              Vi kan oppdatere denne personvernerklæringen fra tid til annen. Ved vesentlige endringer vil vi varsle
              deg via e-post eller ved en merknad på plattformen. Vi oppfordrer deg til å gjennomgå denne erklæringen
              regelmessig for å holde deg informert om hvordan vi beskytter dine personopplysninger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Kontakt oss</h2>
            <p>
              Hvis du har spørsmål om denne personvernerklæringen eller vår behandling av dine personopplysninger,
              kan du kontakte oss på:
            </p>
            <p className="mt-2">
              <strong>Codebase AS</strong><br />
              E-post: support@codebase.no<br />
              Org.nr: [organisasjonsnummer]
            </p>
          </section>

          <div className="mt-12 pt-8 border-t">
            <Link
              href="/legal/vilkar"
              className="text-blue-600 hover:underline font-medium"
            >
              Les våre vilkår for bruk →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
