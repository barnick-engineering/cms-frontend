import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createUser, fetchUserList, fetchUserRoles } from "@/api/userApi"
import type { CreateUserRequest, CreateUserResponse, FetchUserListParams, UserListItem } from "@/interface/userInterface"
import { useShopStore } from "@/stores/shopStore"

// Helper hook to get shopId (for single shop app - "barnick pracharani")
// Since we removed user/me API, shopId should be stored in localStorage or come from login response
export const useShopId = () => {
    const shopId = useShopStore((s) => s.currentShopId)
    // If shopId is not in store, try to get from localStorage
    if (!shopId) {
        const storedShopId = localStorage.getItem('shopId')
        if (storedShopId) {
            return storedShopId
        }
    }
    return shopId || ''
}

export const useUserList = (params: FetchUserListParams) => {
    const { shopId, page = 1, limit = 10, searchBy = '' } = params

    return useQuery<UserListItem[], Error>({
        queryKey: ['userList', shopId, page, limit, searchBy],
        queryFn: async () => {
            const data = await fetchUserList({ shopId, page, limit, searchBy })

            return data.map((u) => ({
                id: u.id,
                name: u.name,
                phone: u.phone,
                createdAt: u.createdAt,
                shopWiseUserRoles: u.shopWiseUserRoles ?? [],
            }))
        },
        enabled: !!shopId,
        placeholderData: keepPreviousData, // smooth pagination
    })
}

// get all roles
export const useUserRoles = () => {
    return useQuery({
        queryKey: ["userRoles"],
        queryFn: fetchUserRoles,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    })
}

// create user
export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation<CreateUserResponse, Error, CreateUserRequest>({
        mutationFn: createUser,
        onSuccess: () => {
            // invalidate user list after successful creation
            queryClient.invalidateQueries({ queryKey: ["userList"] })
        },
    })
}