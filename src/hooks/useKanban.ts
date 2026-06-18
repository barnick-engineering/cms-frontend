import {
  createKanbanTask,
  deleteKanbanTask,
  getKanbanTaskById,
  kanbanBoard,
  moveKanbanTask,
  updateKanbanTask,
} from '@/api/kanbanApi'
import type {
  KanbanBoardParams,
  KanbanBoardResponse,
  KanbanMovePayload,
  KanbanStage,
  KanbanTask,
  KanbanTaskFormInterface,
} from '@/interface/kanbanInterface'
import { messageFromAxiosError } from '@/lib/barnickApiError'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'

export const KANBAN_KEYS = {
  all: ['kanban'] as const,
  board: (params: KanbanBoardParams) =>
    [...KANBAN_KEYS.all, 'board', params] as const,
  detail: (id: number) => [...KANBAN_KEYS.all, id] as const,
}

function sortTasks(tasks: KanbanTask[]) {
  return [...tasks].sort((a, b) => a.position - b.position)
}

function applyMoveToBoard(
  board: KanbanBoardResponse,
  taskId: number,
  targetStage: KanbanStage,
  targetPosition?: number
): KanbanBoardResponse {
  const foundTask = board.columns
    .flatMap((col) => col.tasks)
    .find((t) => t.id === taskId)

  if (!foundTask) return board

  const task: KanbanTask = { ...foundTask, stage: targetStage }

  const columnsAfterRemove = board.columns.map((col) => ({
    ...col,
    tasks: sortTasks(col.tasks.filter((t) => t.id !== taskId)).map((t, i) => ({
      ...t,
      position: i,
    })),
  }))

  return {
    ...board,
    columns: columnsAfterRemove.map((col) => {
      if (col.stage !== targetStage) return col

      const tasks = [...col.tasks]
      const insertAt =
        targetPosition != null
          ? Math.min(Math.max(targetPosition, 0), tasks.length)
          : tasks.length
      tasks.splice(insertAt, 0, task)

      return {
        ...col,
        tasks: tasks.map((t, i) => ({ ...t, position: i })),
      }
    }),
  }
}

export const useKanbanBoard = (
  params: KanbanBoardParams = {},
  options?: { enabled?: boolean }
): UseQueryResult<KanbanBoardResponse, Error> =>
  useQuery({
    queryKey: KANBAN_KEYS.board(params),
    queryFn: () => kanbanBoard(params),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

export const useKanbanTaskById = (
  id: string | number,
  options?: Partial<UseQueryOptions<KanbanTask, Error>>
): UseQueryResult<KanbanTask, Error> =>
  useQuery({
    queryKey: KANBAN_KEYS.detail(Number(id)),
    queryFn: () => getKanbanTaskById(id),
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  })

export const useCreateKanbanTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: KanbanTaskFormInterface) => createKanbanTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_KEYS.all })
    },
  })
}

export const useUpdateKanbanTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number
      data: Partial<KanbanTaskFormInterface>
    }) => updateKanbanTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KANBAN_KEYS.all })
      queryClient.invalidateQueries({
        queryKey: KANBAN_KEYS.detail(Number(variables.id)),
      })
    },
  })
}

export const useDeleteKanbanTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteKanbanTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_KEYS.all })
    },
  })
}

type MoveKanbanTaskVariables = {
  id: number
  payload: KanbanMovePayload
  boardParams: KanbanBoardParams
}

export const useMoveKanbanTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: MoveKanbanTaskVariables) =>
      moveKanbanTask(id, payload),
    onMutate: async ({ id, payload, boardParams }) => {
      const queryKey = KANBAN_KEYS.board(boardParams)
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<KanbanBoardResponse>(queryKey)

      if (previous) {
        queryClient.setQueryData<KanbanBoardResponse>(
          queryKey,
          applyMoveToBoard(previous, id, payload.stage, payload.position)
        )
      }

      return { previous, queryKey }
    },
    onError: (error, _variables, context) => {
      if (context?.previous && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
      toast.error('Failed to move task', {
        description: messageFromAxiosError(error),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_KEYS.all })
    },
  })
}
