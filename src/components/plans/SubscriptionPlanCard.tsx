import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserStar } from "lucide-react"
import type { SubscriptionPlanCardProps } from "@/interface/subscriptionInterface"

const SubscriptionPlanCard = ({ plan }: SubscriptionPlanCardProps) => {
    return (
        <Card className="relative rounded-lg border p-4 hover:shadow-md">
            <div className="mb-4 ml-2 flex items-start justify-between">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg p-2">
                    <UserStar className="h-6 w-6" />
                </div>
            </div>

            <div className="min-h-20 flex flex-col gap-1 ml-2">
                <h2 className="font-semibold truncate" title={plan.name}>{plan.name}</h2>
                <p className="text-gray-500 overflow-hidden text-ellipsis line-clamp-2"
                    title={plan.description}>{plan.description}
                </p>

                <Badge variant={plan.dashboardAccess ? "default" : "secondary"} className="text-xs px-2 py-1 mt-1 w-max">
                    {plan.dashboardAccess ? "Dashboard Access" : "No Dashboard"}
                </Badge>


                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p><span className="font-medium">Price:</span> {plan.price}</p>
                    <p>
                        <span className="font-medium">Transactions Limit:</span>
                        {plan.totalTransactions}
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default SubscriptionPlanCard