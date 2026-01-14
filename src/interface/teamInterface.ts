// Team member interface from API
export interface TeamMember {
  id: number
  first_name: string
  last_name: string
  email: string
  short_name: string
  designation: string
  phone: string
}

// Team list response
export interface TeamListResponse {
  data: TeamMember[]
  response_message: string
  response_code: number
}
