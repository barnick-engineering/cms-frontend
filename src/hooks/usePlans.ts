import {
    createSubscriptionPlan,
    subscriptionPlanList,
} from "@/api/plansApi"
import type {
    CreateSubscriptionPlanDto,
    SubscriptionPlanInterface,
} from "@/interface/subscriptionInterface"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// query keys
export const SUBSCRIPTION_KEYS = {
    all: ["subscriptionPlans"] as const,
    detail: (id: string) => ["subscriptionPlans", id] as const,
}

// list
export const useSubscriptionList = (options?: { enabled?: boolean }) =>
    useQuery<SubscriptionPlanInterface[]>({
        queryKey: SUBSCRIPTION_KEYS.all,
        queryFn: subscriptionPlanList,
        enabled: options?.enabled !== false,
        placeholderData: [],
    })

// create
export const useCreateSubscriptionPlan = () => {
    const queryClient = useQueryClient()

    return useMutation<SubscriptionPlanInterface, Error, CreateSubscriptionPlanDto>({
        mutationFn: createSubscriptionPlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
        },
    })
}

// get subs by id
// export const useSubscriptionDetail = (id: string, options?: { enabled?: boolean }) =>
//     useQuery<SubscriptionPlanInterface>({
//         queryKey: SUBSCRIPTION_KEYS.detail(id),
//         queryFn: () => getSubscriptionById(id),
//         enabled: options?.enabled !== false && !!id,
//     })

// // update
// export const useUpdateSubscriptionPlan = () => {
//     const queryClient = useQueryClient()

//     return useMutation<SubscriptionPlanInterface, Error, UpdateSubscriptionPlanParams>({
//         mutationFn: ({ id, data }) => updateSubscriptionPlan(id, data),
//         onSuccess: (updatedPlan) => {
//             queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
//             queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(updatedPlan.id) })
//         },
//     })
// }

// // delete
// export const useDeleteSubscriptionPlan = () => {
//     const queryClient = useQueryClient()

//     return useMutation<void, Error, string>({
//         mutationFn: (id: string) => deleteSubscriptionPlan(id),
//         onSuccess: (_, id) => {
//             queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.all })
//             queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.detail(id) })
//         },
//     })
// }