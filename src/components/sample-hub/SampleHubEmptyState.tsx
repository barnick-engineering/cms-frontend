import { Images } from 'lucide-react'

type SampleHubEmptyStateProps = {
  hasCustomer: boolean
}

export function SampleHubEmptyState({ hasCustomer }: SampleHubEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <Images className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-medium">
        {hasCustomer ? 'No samples yet' : 'Select a customer'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasCustomer
          ? 'Upload an image sample for this customer using the Upload button.'
          : 'Choose a customer from the filter above to view their sample gallery.'}
      </p>
    </div>
  )
}
