import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canSkip?: boolean;
  canProceed?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSkip,
  onSubmit,
  isSubmitting = false,
  canSkip = false,
  canProceed = true,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
      >
        <IconArrowLeft className="mr-2 h-4 w-4" />
        Tilbake
      </Button>

      <div className="flex gap-2">
        {canSkip && onSkip && !isLastStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            Hopp over
          </Button>
        )}

        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Oppretter ...
              </>
            ) : (
              "Opprett kalender"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={isSubmitting || !canProceed}>
            Neste
            <IconArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
