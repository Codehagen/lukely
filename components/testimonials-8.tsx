import { Hulu } from "@/components/logos/hulu";
import { TailwindCSS } from "@/components/logos/tailwindcss";
import { Stripe } from "@/components/logos/stripe";

const MESCHAC_AVATAR = "https://avatars.githubusercontent.com/u/47919550?v=4";
const BERNARD_AVATAR = "https://avatars.githubusercontent.com/u/31113941?v=4";
const THEO_AVATAR = "https://avatars.githubusercontent.com/u/68236786?v=4";
const GLODIE_AVATAR = "https://avatars.githubusercontent.com/u/99137927?v=4";
const SHADCN_AVATAR = "https://avatars.githubusercontent.com/u/124599?v=4";
const ADAM_AVATAR = "https://avatars.githubusercontent.com/u/4323180?v=4";
const YVES_AVATAR = "https://avatars.githubusercontent.com/u/55670723?v=4";
const MICKY_AVATAR = "https://avatars.githubusercontent.com/u/69605071?v=4";

const TESTIMONIALS = [
  {
    name: "Yves Kalume",
    role: "CRM-sjef, Moneco",
    avatar: YVES_AVATAR,
    testimonial:
      "Lukely hjalp oss å hente inn 38 000 kvalifiserte leads på tre uker. Samtykke-funksjonen og integrasjonene gjorde at teamet vårt kunne aktivere alle kontaktene før jul.",
  },
  {
    name: "Meschac Irung",
    role: "Leder for livssyklusmarkedsføring, Hulu",
    avatar: MESCHAC_AVATAR,
    testimonial:
      "Vi lanserte på 20 språk uten utviklerstøtte. Lukely holdt merkevareopplevelsen konsistent overalt og doblet opt-in-raten vår år for år.",
  },
  {
    name: "Bernard Ngandu",
    role: "Growth Operations-leder, Stripe",
    avatar: BERNARD_AVATAR,
    testimonial:
      "GDPR-prosessene bremset oss før. Lukely håndterer samtykke, double opt-in og revisjonslogger, så juridisk og markedsføring jobber endelig i takt.",
  },
  {
    name: "Glodie Lukose",
    role: "Markedssjef, Prime Video",
    avatar: GLODIE_AVATAR,
    testimonial:
      "Daglige påminnelser og øyeblikkelige trekninger fikk publikum tilbake. Engasjementet lå over 60 % gjennom hele kampanjen.",
  },
  {
    name: "Theo Balick",
    role: "CTO, Lukely",
    avatar: THEO_AVATAR,
    testimonial:
      "Vi bygde Lukely for at markedsførere skal kunne bevege seg raskt uten å gi slipp på sikkerhet eller merkevarekontroll. Å se kundene nå julemålene sine er grunnen til at vi gjør dette.",
  },
  {
    name: "Ras Micky",
    role: "E-handelsstrateg",
    avatar: MICKY_AVATAR,
    testimonial:
      "Lukely ga oss fleksibilitet til å matche hver giveaway med produktslippene våre. Malredigeringen er intuitiv, men kraftig nok for egne animasjoner.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="reviews"
      className="relative border-t border-foreground/10 bg-muted/50"
    >
      <div className="mx-auto max-w-6xl border-x border-foreground/10 px-6 py-24">
        <div className="mx-auto max-w-2xl text-balance text-center">
          <h2 className="text-foreground mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Dette sier kundene om Lukely
          </h2>
          <p className="text-muted-foreground mb-6 md:mb-12 lg:mb-16">
            Bli med globale merkevarer som bruker Lukely til å drive
            engasjerende sesongkampanjer, bygge abonnentlister og skape målbar
            juleomsetning.
          </p>
        </div>
        <div className="rounded-(--radius) border-border/50 relative lg:border">
          <div className="lg:*:nth-4:rounded-r-none lg:*:nth-5:rounded-br-none lg:*:nth-6:rounded-b-none lg:*:nth-5:rounded-tl-none lg:*:nth-3:rounded-l-none lg:*:nth-2:rounded-tl-none lg:*:nth-2:rounded-br-none lg:*:nth-1:rounded-t-none grid gap-4 sm:grid-cols-2 sm:grid-rows-4 lg:grid-cols-3 lg:grid-rows-3 lg:gap-px">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                avatar={testimonial.avatar}
                testimonial={testimonial.testimonial}
              />
            ))}

            <div className="max-lg:rounded-(--radius) lg:rounded-tl-(--radius) lg:rounded-br-(--radius) bg-card ring-foreground/5 row-start-1 flex flex-col justify-between gap-6 border border-transparent p-8 shadow-lg shadow-black/10 ring-1 lg:col-start-1">
              <div className="space-y-6">
                <TailwindCSS height={20} width={136} />
                <p>
                  "Lukely fjernet alle tekniske hindringer. Vi rebrandet
                  kalenderen, lokaliserte innholdet og automatiserte premier –
                  alt i ett dashbord på under et døgn."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="ring-foreground/10 aspect-square size-9 overflow-hidden rounded-lg border border-transparent shadow-md shadow-black/15 ring-1">
                  <img
                    src={ADAM_AVATAR}
                    alt="Adam Wathan"
                    className="h-full w-full object-cover"
                    width={460}
                    height={460}
                    loading="lazy"
                  />
                </div>
                <div className="space-y-px">
                  <p className="text-sm font-medium">Adam Wathan</p>
                  <p className="text-muted-foreground text-xs">
                    CEO i Tailwind Labs
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-(--radius) bg-card ring-foreground/5 row-start-3 flex flex-col justify-between gap-6 border border-transparent p-8 shadow-lg shadow-black/10 ring-1 sm:col-start-2 lg:row-start-2">
              <div className="space-y-6">
                <Hulu height={20} width={56} />
                <p>
                  "Automatiserte påminnelser holder abonnentene våre gira.
                  Daglige besøk lå over 70 %, og vi økte SMS-samtykke 3,4 ganger
                  sammenlignet med tidligere kampanjer."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="ring-foreground/10 aspect-square size-9 overflow-hidden rounded-lg border border-transparent shadow-md shadow-black/15 ring-1">
                  <img
                    src={SHADCN_AVATAR}
                    alt="Shadcn"
                    className="h-full w-full object-cover"
                    width={460}
                    height={460}
                    loading="lazy"
                  />
                </div>
                <div className="space-y-px">
                  <p className="text-sm font-medium">Shadcn</p>
                  <p className="text-muted-foreground text-xs">
                    Frontend-utvikler, Hulu
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-(--radius) bg-card ring-foreground/5 flex flex-col justify-between gap-6 border border-transparent p-8 shadow-lg shadow-black/10 ring-1 sm:row-start-2 lg:col-start-3 lg:row-start-3 lg:rounded-bl-none lg:rounded-tr-none">
              <div className="space-y-6">
                <Stripe height={24} width={56} />
                <p>
                  "Rapporteringspakken viser nøyaktig hvilke premier, kanaler og
                  segmenter som konverterer best. Innsikten løftet
                  gjensalgsinntektene våre med 18 %."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="ring-foreground/10 aspect-square size-9 overflow-hidden rounded-lg border border-transparent shadow-md shadow-black/15 ring-1">
                  <img
                    src={GLODIE_AVATAR}
                    alt="Glodie Lukose"
                    className="h-full w-full object-cover"
                    width={460}
                    height={460}
                    loading="lazy"
                  />
                </div>
                <div className="space-y-px">
                  <p className="text-sm font-medium">Glodie Lukose</p>
                  <p className="text-muted-foreground text-xs">
                    Markedssjef, Stripe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type TestimonialCardProps = {
  name: string;
  role: string;
  avatar: string;
  testimonial: string;
};

const TestimonialCard = ({
  name,
  role,
  avatar,
  testimonial,
}: TestimonialCardProps) => {
  return (
    <div className="bg-card/25 rounded-(--radius) ring-foreground/[0.07] flex flex-col justify-end gap-6 border border-transparent p-8 ring-1">
      <p className='text-foreground self-end text-balance before:mr-1 before:content-["\201C"] after:ml-1 after:content-["\201D"]'>
        {testimonial}
      </p>
      <div className="flex items-center gap-3">
        <div className="ring-foreground/10 aspect-square size-9 overflow-hidden rounded-lg border border-transparent shadow-md shadow-black/15 ring-1">
          <img
            src={avatar}
            alt={name}
            className="h-full w-full object-cover"
            width={460}
            height={460}
            loading="lazy"
          />
        </div>
        <div className="space-y-px">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
};
