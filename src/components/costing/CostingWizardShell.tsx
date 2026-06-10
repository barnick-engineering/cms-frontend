import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Follow the steps below to build your quote
          </p>
        </div>
      </div>

      <CostingStepNav
        steps={steps}
        currentStep={currentStep}
        onStepClick={onStepChange}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <Card className="costing-no-print shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-lg">{stepTitle}</CardTitle>
            {stepDescription && (
              <CardDescription>{stepDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8">{children}</CardContent>
          <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-4 sm:px-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {!isLastStep && (
              <Button type="button" onClick={onNext} className="gap-1">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {isLastStep && (
              <span className="text-sm text-muted-foreground">
                Review your quote below
              </span>
            )}
          </div>
        </Card>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          {summary}
        </div>
      </div>
    </div>
  )
}
