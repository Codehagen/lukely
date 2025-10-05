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
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted && onStepClick;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex-1",
                  index !== steps.length - 1 && "pr-8 sm:pr-20"
                )}
              >
                {/* Connector line */}
                {index !== steps.length - 1 && (
                  <div
                    className="absolute left-0 top-5 -ml-px mt-0.5 h-0.5 w-full"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "h-full w-full",
                        isCompleted
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  </div>
                )}

                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "group relative flex flex-col items-center",
                    isClickable && "cursor-pointer"
                  )}
                >
                  {/* Step circle */}
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-primary bg-background text-primary",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted-foreground/25 text-muted-foreground",
                      isClickable && "group-hover:border-primary"
                    )}
                  >
                    {isCompleted ? (
                      <IconCheck className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </span>

                  {/* Step title */}
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium transition-colors",
                      isCurrent && "text-foreground",
                      isCompleted && "text-foreground",
                      !isCompleted &&
                        !isCurrent &&
                        "text-muted-foreground"
                    )}
                  >
                    <span className="hidden sm:inline">{step.title}</span>
                    {step.optional && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (valgfri)
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
