import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/api/accountApi'
import type { CreateUserPayload } from '@/interface/accountInterface'

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamList'] })
    },
  })
}
