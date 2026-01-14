import { useState } from "react"
import { Main } from "@/components/layout/main"
import { Separator } from "@/components/ui/separator"
import { useSubscriptionList } from "@/hooks/usePlans"
import SubscriptionPlanCard from "@/components/plans/SubscriptionPlanCard"
import SubscriptionPlanMutateDrawer from "@/components/plans/SubscriptionPlanMutateDrawer"
// import type { SubscriptionPlanInterface } from "@/interface/subscriptionInterface"

const Plans = () => {
  const { data, isLoading } = useSubscriptionList()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Here is a list of all your subscription plans
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Loading / empty */}
      {isLoading && <p className="text-muted-foreground">Loading plans...</p>}
      {!isLoading && data?.length === 0 && (
        <p className="text-muted-foreground">No subscription plans found.</p>
      )}

      {/* Plan Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
          />
        ))}
      </div>

      {/* Create */}
      <SubscriptionPlanMutateDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </Main>
  )
}

export default Plans