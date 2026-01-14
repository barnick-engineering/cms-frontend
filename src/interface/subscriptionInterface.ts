export interface SubscriptionPlanInterface {
    id: string
    no: string
    name: string
    description: string
    price: number
    totalTransactions: number
    dashboardAccess: boolean
}

export interface CreateSubscriptionPlanDto {
    name: string
    description: string
    price: number
    totalTransactions: number
    dashboardAccess: boolean
}

export interface UpdateSubscriptionPlanParams {
    id: string
    data: CreateSubscriptionPlanDto
}

export interface SubscriptionPlanCardProps {
    plan: SubscriptionPlanInterface
}

export interface SubscriptionPlanDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPlan?: SubscriptionPlanInterface | null
}