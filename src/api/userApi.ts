import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"
import type { CreateUserRequest, CreateUserResponse, FetchUserListParams, UserInterface } from "@/interface/userInterface"

// user list
export const fetchUserList = async ({
    shopId,
    page = 1,
    limit = 10,
    searchBy = '',
}: FetchUserListParams): Promise<UserInterface[]> => {
    const res = await axiosInstance.get<UserInterface[]>(apiEndpoints.user.userList, {
        params: {
            shopId,
            page,
            limit,
            searchBy: searchBy || undefined, // avoid sending empty param
        },
    })
    return res.data
}

// fetch user all roles
export const fetchUserRoles = async () => {
    const res = await axiosInstance.get(apiEndpoints.user.allRoles)
    return res.data
}

// create user
export const createUser = async (
    payload: CreateUserRequest
): Promise<CreateUserResponse> => {
    const res = await axiosInstance.post<CreateUserResponse>(
        apiEndpoints.user.createUser,
        payload
    )
    return res.data
}