import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CostingStepNav, type CostingStep } from './CostingStepNav'

type CostingWizardShellProps = {
  title: string
  icon?: React.ReactNode
  steps: CostingStep[]
  currentStep: number
  onStepChange: (index: number) => void
  stepTitle: string
  stepDescription?: string
  children: React.ReactNode
  summary?: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  isLastStep?: boolean
}

function WizardNavButtons({
  currentStep,
  isLastStep,
  onBack,
  onNext,
  className,
}: {
  currentStep: number
  isLastStep?: boolean
  onBack?: () => void
  onNext?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-t bg-muted/10 px-4 py-3 sm:px-6',
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
        className="gap-1 min-w-[5rem]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Button>
      {!isLastStep ? (
        <Button type="button" onClick={onNext} className="gap-1 min-w-[5rem]">
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <span className="text-xs sm:text-sm text-muted-foreground text-right">
          Review your quote below
        </span>
      )}
    </div>
  )
}

export function CostingWizardShell({
  title,
  icon,
  steps,
  currentStep,
  onStepChange,
  stepTitle,
  stepDescription,
  children,
  summary,
  onBack,
  onNext,
  isLastStep,
}: CostingWizardShellProps) {
  const isMobile = useIsMobile()
  const [summaryOpen, setSummaryOpen] = useState(isLastStep ?? false)

  useEffect(() => {
    if (isLastStep) {
      setSummaryOpen(true)
    }
  }, [isLastStep])

  const summaryPanel = summary && (
    <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      {isMobile ? (
        <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between gap-2 bg-transparent"
            >
              <span className="font-medium">Quote summary</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  summaryOpen && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-4">
            {summary}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        summary
      )}
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      <CostingStepNav
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepChange}
      />

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0">
          <Card className="costing-no-print shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20 pb-3 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">{stepTitle}</CardTitle>
              {stepDescription && (
                <CardDescription>{stepDescription}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
              {children}
            </CardContent>
            <WizardNavButtons
              currentStep={currentStep}
              isLastStep={isLastStep}
              onBack={onBack}
              onNext={onNext}
              className="hidden md:flex sm:px-8"
            />
          </Card>
        </div>

        {summaryPanel}
      </div>

      {/* Sticky nav on mobile — always reachable without scrolling past summary */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <WizardNavButtons
          currentStep={currentStep}
          isLastStep={isLastStep}
          onBack={onBack}
          onNext={onNext}
          className="border-t-0 bg-transparent"
        />
      </div>
    </div>
  )
}
