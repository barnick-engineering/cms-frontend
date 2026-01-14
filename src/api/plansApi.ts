import type { CreateSubscriptionPlanDto, SubscriptionPlanInterface } from "@/interface/subscriptionInterface"
import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"

// list
export const subscriptionPlanList = async (): Promise<SubscriptionPlanInterface[]> => {
    const res = await axiosInstance.get(apiEndpoints.subscriptionPlans.subscriptionList)
    return res.data ?? []
}

// create
export const createSubscriptionPlan = async (
    data: CreateSubscriptionPlanDto
): Promise<SubscriptionPlanInterface> => {
    const res = await axiosInstance.post(apiEndpoints.subscriptionPlans.createSubscriptionPlan, data)
    return res.data
}

// // get by subs id
// export const getSubscriptionById = async (id: string): Promise<SubscriptionPlanInterface> => {
//     const url = apiEndpoints.subscriptionPlans.getSubscriptionPlanById.replace("{id}", id)
//     const res = await axiosInstance.get(url)
//     return res.data
// }

// // update
// export const updateSubscriptionPlan = async (
//     id: string,
//     data: CreateSubscriptionPlanDto
// ): Promise<SubscriptionPlanInterface> => {
//     const url = apiEndpoints.subscriptionPlans.updateSubscriptionPlan.replace("{id}", id)
//     const res = await axiosInstance.put(url, data)
//     return res.data
// }

// // delete
// export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
//     const url = apiEndpoints.subscriptionPlans.deleteSubscriptionPlan.replace("{id}", id)
//     await axiosInstance.delete(url)
// }