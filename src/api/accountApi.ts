import { apiEndpoints } from '@/config/api'
import type {
  CreateUserPayload,
  CreateUserResponse,
} from '@/interface/accountInterface'
import { axiosInstance } from './axios'

function buildCreateUserBody(payload: CreateUserPayload) {
  const email = payload.email.trim()
  const first = payload.first_name?.trim()
  const last = payload.last_name?.trim()
  return {
    email,
    password: payload.password,
    confirm_password: payload.confirm_password,
    ...(first ? { first_name: first } : {}),
    ...(last ? { last_name: last } : {}),
  }
}

export const createUser = async (
  payload: CreateUserPayload
): Promise<CreateUserResponse> => {
  const res = await axiosInstance.post<CreateUserResponse>(
    apiEndpoints.user.createUser,
    buildCreateUserBody(payload)
  )
  return res.data
}
