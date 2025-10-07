import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFileText, IconBrain, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StepFormatProps {
  formData: {
    calendarFormat: "landing" | "quiz" | "";
  };
  onFormatChange: (format: "landing" | "quiz") => void;
}

export function StepFormat({ formData, onFormatChange }: StepFormatProps) {
  const formats = [
    {
      id: "landing" as const,
      icon: IconFileText,
      title: "Landingpage",
      description: "Enkel deltakelse med navn og e-post",
      benefits: [
        "Rask registrering for brukerne",
        "Lav terskel for deltakelse",
        "Maksimalt antall deltakere",
        "Perfekt for leadgenerering",
      ],
      color: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-600 dark:border-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "quiz" as const,
      icon: IconBrain,
      title: "Quiz-kalender",
      description: "Interaktiv quiz før deltakelse",
      benefits: [
        "Høyere engasjement og interaksjon",
        "Morsomt og underholdende",
        "AI-genererte spørsmål automatisk",
        "Perfekt for gamification",
      ],
      color: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-600 dark:border-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Velg kalenderformat</h3>
        <p className="text-sm text-muted-foreground">
          Hvordan skal brukerne delta i kalenderen din?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formats.map((format) => {
          const isSelected = formData.calendarFormat === format.id;
          const Icon = format.icon;

          return (
            <Card
              key={format.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg relative",
                isSelected
                  ? `${format.borderColor} border-2 shadow-md`
                  : "border-2 border-transparent hover:border-border"
              )}
              onClick={() => onFormatChange(format.id)}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className={cn("rounded-full p-1.5 shadow-lg", format.bgColor)}>
                    <IconCheck className={cn("h-5 w-5", format.color)} />
                  </div>
                </div>
              )}

              <CardHeader>
                <div className={cn("mb-3 inline-flex p-3 rounded-xl", format.bgColor)}>
                  <Icon className={cn("h-8 w-8", format.color)} />
                </div>
                <CardTitle className="text-xl">{format.title}</CardTitle>
                <CardDescription className="text-base">{format.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {format.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <IconCheck className={cn("h-4 w-4 mt-0.5 flex-shrink-0", format.color)} />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {formData.calendarFormat && (
        <div className={cn("p-4 rounded-lg border",
          formData.calendarFormat === "landing"
            ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
            : "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
        )}>
          <p className="text-sm font-medium">
            {formData.calendarFormat === "landing" ? (
              <>✓ Du har valgt <strong>Landingpage-format</strong>. Brukerne fyller kun ut et enkelt skjema.</>
            ) : (
              <>✓ Du har valgt <strong>Quiz-format</strong>. Brukerne må svare på quiz før deltakelse.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
