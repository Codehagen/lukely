import { cn } from "@/lib/utils";
import { IconCheck } from "@tabler/icons-react";

export interface Step {
  id: number;
  title: string;
  optional?: boolean;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export function Stepper({ currentStep, steps, onStepClick }: StepperProps) {
  return (
    <div className="w-full">
      <nav
        aria-label="Form progression"
        className="flex flex-wrap items-center gap-2 sm:gap-3"
      >
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = (isCompleted || isCurrent) && onStepClick;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable || isCurrent}
              className={cn(
                "group relative flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition",
                isCurrent &&
                  "border-primary bg-background text-foreground shadow-sm",
                isCompleted && !isCurrent &&
                  "border-primary/40 bg-primary/10 text-primary",
                !isCompleted && !isCurrent &&
                  "border-transparent bg-muted/60 text-muted-foreground",
                isClickable && !isCurrent && "hover:border-primary/60 hover:bg-background"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted && !isCurrent &&
                    "border-primary/40 bg-primary/10 text-primary",
                  !isCompleted && !isCurrent &&
                    "border-border bg-background text-muted-foreground",
                  isClickable && !isCurrent && "group-hover:border-primary"
                )}
              >
                {isCompleted ? <IconCheck className="h-4 w-4" /> : step.id}
              </span>

              <span className="flex flex-col items-start leading-tight">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Steg {step.id}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isCurrent && "text-foreground",
                    isCompleted && !isCurrent && "text-primary"
                  )}
                >
                  {step.title}
                </span>
                {step.optional && (
                  <span className="text-[11px] text-muted-foreground">Valgfritt</span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
