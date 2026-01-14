// Auth-related interfaces
export interface UserSignInInterface {
    email: string
    password: string
}

export interface AuthResponseInterface {
    // Support both naming conventions
    access_token?: string
    refresh_token?: string
    access?: string
    refresh?: string
    data?: {
        access_token?: string
        refresh_token?: string
        access?: string
        refresh?: string
    }
    response_code?: number
    response_message?: string
}

export interface AuthState {
    access_token: string | null
    refresh_token: string | null
    isAuthenticated: boolean
    setTokens: (access: string, refresh: string) => void
    clearTokens: () => void
}

// User state and info
export interface UserInterface {
    id: string
    name: string
    phone: string
    createdAt: string
    shopWiseUserRoles: ShopWiseUserRole[]
}

export interface UserState {
    user: UserInterface | null
    setUser: (user: UserInterface) => void
    clearUser: () => void
}

// Roles and shops
export interface Role {
    id: string
    name: string
}

export interface Shop {
    id: string
    name: string
    address?: string
    isActive?: boolean
}

export interface ShopWiseUserRole {
    id: string
    shopId: string
    isCurrent: boolean
    shop: Shop
    role: Role
}

// Full User interface from API
export interface User {
    id: string
    firstName: string
    lastName: string
    username: string
    email: string
    phoneNumber: string
    status: 'active' | 'inactive' | 'invited' | 'suspended'
    role: 'superadmin' | 'admin' | 'cashier' | 'manager'
    createdAt: Date
    updatedAt: Date
    shopWiseUserRoles: ShopWiseUserRole[]
}

// Optional: simplified list view for tables
export interface UserListItem {
    id: string
    name: string
    phone: string
    createdAt: string | Date
    shopWiseUserRoles: ShopWiseUserRole[]
}

// Create user request/response
export interface CreateUserRequest {
    name: string
    phone: string
    password: string
    shopId: string
    roleId: string
}

export interface CreateUserResponse {
    id: string
    name: string
    phone: string
    shopWiseUserRoles: {
        shop: { id: string }
        role: { id: string }
    }[]
    createdAt: string
}

export interface FetchUserListParams {
    shopId: string
    page?: number
    limit?: number
    searchBy?: string
}