import { CalendarType } from "@/app/generated/prisma";

export interface CalendarTemplate {
  type: CalendarType;
  format: "landing" | "quiz";
  title: string;
  description: string;
  doorCount: number;
  defaultDates?: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
  };
  flexible: boolean;
  theme: {
    colors: string[];
    icon: string;
    gradient: string;
  };
  landingDefaults?: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    primaryActionLabel: string;
    primaryActionUrl?: string;
    secondaryActionLabel?: string;
    secondaryActionUrl?: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    showLeadForm?: boolean;
  };
}

export const CALENDAR_TEMPLATES: Record<string, CalendarTemplate> = {
  christmas: {
    type: "CHRISTMAS",
    format: "quiz",
    title: "Julekalender",
    description: "24 dager med høytidsoverraskelser frem mot jul",
    doorCount: 24,
    defaultDates: {
      startMonth: 11, // December (0-indexed)
      startDay: 1,
      endMonth: 11,
      endDay: 24,
    },
    flexible: false,
    theme: {
      colors: ["#C41E3A", "#165B33", "#F4C430"],
      icon: "🎄",
      gradient: "from-red-600 to-green-700",
    },
  },
  valentine: {
    type: "VALENTINE",
    format: "quiz",
    title: "Valentinsnedtelling",
    description: "14 dager med kjærlighet frem mot Valentinsdagen",
    doorCount: 14,
    defaultDates: {
      startMonth: 1, // February (0-indexed)
      startDay: 1,
      endMonth: 1,
      endDay: 14,
    },
    flexible: false,
    theme: {
      colors: ["#FF69B4", "#DC143C", "#FFC0CB"],
      icon: "💝",
      gradient: "from-pink-500 to-red-600",
    },
  },
  easter: {
    type: "EASTER",
    format: "quiz",
    title: "Påskekalender",
    description: "Tilpassbar kalender for påskefeiring",
    doorCount: 7,
    flexible: true,
    theme: {
      colors: ["#FADADD", "#E6E6FA", "#F0E68C"],
      icon: "🐰",
      gradient: "from-purple-400 to-pink-300",
    },
  },
  custom: {
    type: "CUSTOM",
    format: "quiz",
    title: "Egen kalender",
    description: "Lag din egen kalender med valgte datoer og antall luker",
    doorCount: 12,
    flexible: true,
    theme: {
      colors: ["#3B82F6", "#8B5CF6", "#EC4899"],
      icon: "🎁",
      gradient: "from-blue-500 to-purple-600",
    },
  },
  fathersDay: {
    type: "FATHERS_DAY",
    format: "landing",
    title: "Farsdagskonkurranse",
    description: "Konkurranselandingsside for farsdagen - samle leads med sjansen til å vinne drømmegaven til far",
    doorCount: 0,
    flexible: true,
    theme: {
      colors: ["#1E3A8A", "#374151", "#92400E"],
      icon: "👔",
      gradient: "from-blue-900 to-gray-700",
    },
    landingDefaults: {
      heroTitle: "Vinn drømmegaven til far!",
      heroSubtitle: "Delta i vår store farsdagskonkurranse",
      heroDescription: "Farsdagen feires andre søndag i november. Registrer deg nå og vær med i trekningen om den perfekte gaven til verdens beste far!",
      primaryActionLabel: "Delta i konkurransen",
      secondaryActionLabel: "Les mer om premien",
      features: [
        {
          title: "Enkel påmelding",
          description: "Fyll inn navn, e-post og telefon - så er du med i trekningen!",
        },
        {
          title: "Fantastiske premier",
          description: "Vinn eksklusive produkter som far garantert vil elske.",
        },
        {
          title: "Gratis å delta",
          description: "Ingen kjøp nødvendig. Alle som registrerer seg er med i konkurransen.",
        },
      ],
      showLeadForm: true,
    },
  },
  landing: {
    type: "LANDING_PAGE",
    format: "landing",
    title: "Leadmagnet landingpage",
    description: "En fokusert destinasjon for å samle leads og vise frem verdiforslaget ditt",
    doorCount: 0,
    flexible: true,
    theme: {
      colors: ["#0EA5E9", "#2563EB", "#7C3AED"],
      icon: "🚀",
      gradient: "from-sky-500 to-indigo-600",
    },
    landingDefaults: {
      heroTitle: "Bygg relasjoner og samle nye leads",
      heroSubtitle: "Lanser et engasjerende univers som viser frem verdien din og samler innsikt om målgruppen.",
      heroDescription: "Del nyheter, kampanjer og eksklusive tilbud på et øyeblikk. Perfekt for kampanjer der du ikke trenger kalenderluker.",
      primaryActionLabel: "Start kampanjen",
      secondaryActionLabel: "Se eksempel",
      features: [
        {
          title: "Innsikt i sanntid",
          description: "Følg trafikk og konverteringer direkte i dashboardet.",
        },
        {
          title: "Smart leadskjema",
          description: "Tilpass hvilke felt du trenger og koble til eksisterende arbeidsflyt.",
        },
        {
          title: "Merkevarebygging",
          description: "Tilpass farger, fonter og budskap for å matche profilen din.",
        },
      ],
      showLeadForm: true,
    },
  },
};

export function getTemplateByType(type: CalendarType): CalendarTemplate | undefined {
  return Object.values(CALENDAR_TEMPLATES).find((t) => t.type === type);
}

export function generateDoorDates(
  startDate: Date,
  doorCount: number
): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < doorCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function getDefaultDatesForYear(
  template: CalendarTemplate,
  year: number
): { startDate: Date; endDate: Date } | null {
  if (!template.defaultDates) return null;

  const { startMonth, startDay, endMonth, endDay } = template.defaultDates;

  const startDate = new Date(year, startMonth, startDay);
  const endDate = new Date(year, endMonth, endDay);

  return { startDate, endDate };
}
