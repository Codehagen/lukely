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
  variant?: "default" | "compact";
  orientation?: "horizontal" | "vertical";
}

export function Stepper({
  currentStep,
  steps,
  onStepClick,
  variant = "default",
  orientation = "horizontal"
}: StepperProps) {
  const isCompact = variant === "compact";
  const isVertical = orientation === "vertical";

  return (
    <div className="w-full">
      <nav
        aria-label="Form progression"
        className={cn(
          "flex gap-2",
          isVertical ? "flex-col" : "flex-row flex-wrap items-center",
          isCompact ? "gap-2" : "gap-2 sm:gap-3"
        )}
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
                "group relative flex items-center rounded-full border font-medium transition",
                isCompact ? "gap-2 px-3 py-1.5 text-xs" : "gap-3 px-4 py-2 text-sm",
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
                  "flex items-center justify-center rounded-full border font-semibold transition",
                  isCompact ? "h-6 w-6 text-xs" : "h-7 w-7 text-xs",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isCompleted && !isCurrent &&
                    "border-primary/40 bg-primary/10 text-primary",
                  !isCompleted && !isCurrent &&
                    "border-border bg-background text-muted-foreground",
                  isClickable && !isCurrent && "group-hover:border-primary"
                )}
              >
                {isCompleted ? <IconCheck className={cn(isCompact ? "h-3 w-3" : "h-4 w-4")} /> : step.id}
              </span>

              <span className={cn("flex flex-col items-start leading-tight", isCompact && "gap-0")}>
                {!isCompact && (
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Steg {step.id}
                  </span>
                )}
                <span
                  className={cn(
                    "font-semibold",
                    isCompact ? "text-xs" : "text-sm",
                    isCurrent && "text-foreground",
                    isCompleted && !isCurrent && "text-primary"
                  )}
                >
                  {step.title}
                </span>
                {step.optional && (
                  <span className={cn("text-muted-foreground", isCompact ? "text-[10px]" : "text-[11px]")}>
                    Valgfritt
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
