import { ChartIllustration } from "@/components/chart-illustration";
import { InvoiceIllustration } from "@/components/invoice-illustration";

export default function FeaturesSection() {
  return (
    <section className="relative border-t border-foreground/10 bg-muted/50">
      <div className="@container mx-auto max-w-6xl border-x border-foreground/10 px-6 py-24">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            Kampanjefunksjoner
          </span>
          <h2 className="text-foreground mt-4 text-3xl font-semibold sm:text-4xl">
            Alt du trenger for å øke juletrafikk og leads
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Design stemningsfulle opplevelser, samle førstepartsdata ansvarlig
            og konverter deltakerne med automatisert oppfølging – alt i Lukely.
          </p>
        </div>
        <div className="ring-foreground/10 @4xl:grid-cols-2 @max-4xl:divide-y @4xl:divide-x relative grid overflow-hidden rounded-2xl border border-transparent bg-card shadow-md shadow-black/5 ring-1">
          <div className="row-span-2 grid grid-rows-subgrid gap-8">
            <div className="px-8 pt-8">
              <h3 className="text-balance font-semibold">
                Full oversikt i ett dashbord
              </h3>
              <p className="text-muted-foreground mt-3">
                Følg med på kampanjeresultater, leads, samtykker og engasjement
                i sanntid – alt samlet i et brukervennlig dashbord.
              </p>
            </div>
            <div className="self-end pb-4">
              <ChartIllustration />
            </div>
          </div>
          <div className="row-span-2 grid grid-rows-subgrid gap-8">
            <div className="relative z-10 px-8 pt-8">
              <h3 className="text-balance font-semibold">
                Automatiser påminnelser og premier
              </h3>
              <p className="text-muted-foreground mt-3">
                Planlegg daglige e-poster og SMS, håndter GDPR-samtykke og trekk
                vinnere automatisk med revisjonssikre logger.
              </p>
            </div>
            <div className="self-end px-8 pb-8">
              <InvoiceIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
