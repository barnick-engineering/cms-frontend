export interface CreateUserPayload {
  email: string
  password: string
  confirm_password: string
  first_name?: string
  last_name?: string
}

export interface CreateUserResponse {
  data: Record<string, unknown>
  response_message: string
  response_code: number
}
