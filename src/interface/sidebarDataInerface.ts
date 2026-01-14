import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
    title: string
    url?: string
    icon: LucideIcon
    items?: SidebarItem[]
}

export interface SidebarNavGroup {
    title: string
    items: SidebarItem[]
}

export interface SidebarTeam {
    name: string
    logo: LucideIcon
    plan: string
}

export interface SidebarUser {
    name: string
    email: string
    avatar: string
}

export interface SidebarData {
    user: SidebarUser
    teams: SidebarTeam[]
    navGroups: SidebarNavGroup[]
}

export interface AuthenticatedLayoutProps {
    children?: React.ReactNode
}

export interface Team {
    id: string
    name: string
    logo: React.ElementType
}

export interface TeamSwitcherProps {
    teams: Team[]
}