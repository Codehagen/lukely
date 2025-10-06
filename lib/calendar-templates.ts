import { CalendarType } from "@/app/generated/prisma";

export interface CalendarTemplate {
  type: CalendarType;
  titleKey: string; // Translation key
  descriptionKey: string; // Translation key
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
}

export const CALENDAR_TEMPLATES: Record<string, CalendarTemplate> = {
  christmas: {
    type: "CHRISTMAS",
    titleKey: "Calendar.templates.christmas.title",
    descriptionKey: "Calendar.templates.christmas.description",
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
    titleKey: "Calendar.templates.valentine.title",
    descriptionKey: "Calendar.templates.valentine.description",
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
    titleKey: "Calendar.templates.easter.title",
    descriptionKey: "Calendar.templates.easter.description",
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
    titleKey: "Calendar.templates.custom.title",
    descriptionKey: "Calendar.templates.custom.description",
    doorCount: 12,
    flexible: true,
    theme: {
      colors: ["#3B82F6", "#8B5CF6", "#EC4899"],
      icon: "🎁",
      gradient: "from-blue-500 to-purple-600",
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
