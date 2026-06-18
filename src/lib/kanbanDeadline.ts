import { endOfDay, parseISO } from 'date-fns'
import type { KanbanStage } from '@/interface/kanbanInterface'

export type DeadlineStatus = {
  isMissed: boolean
  countdown: string | null
}

function parseDeadlineEnd(deadline: string): Date | null {
  try {
    return endOfDay(parseISO(deadline))
  } catch {
    return null
  }
}

function pluralize(count: number, singular: string, plural?: string) {
  const unit = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${unit}`
}

/** Human-readable time until deadline end-of-day, or missed state. */
export function getDeadlineStatus(
  deadline: string,
  options: { isOverdue?: boolean; stage?: KanbanStage; now?: Date } = {}
): DeadlineStatus {
  const { isOverdue = false, stage, now = new Date() } = options
  const deadlineEnd = parseDeadlineEnd(deadline)

  if (!deadlineEnd) {
    return { isMissed: isOverdue, countdown: null }
  }

  if (stage === 'done') {
    return { isMissed: false, countdown: null }
  }

  const isMissed = isOverdue || deadlineEnd.getTime() < now.getTime()

  if (isMissed) {
    return { isMissed: true, countdown: null }
  }

  const diffMs = deadlineEnd.getTime() - now.getTime()
  const totalMinutes = Math.floor(diffMs / (60 * 1000))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  const parts: string[] = []

  if (days > 0) parts.push(pluralize(days, 'day'))
  if (hours > 0) parts.push(pluralize(hours, 'hr', 'hrs'))
  if (minutes > 0 || parts.length === 0) {
    parts.push(pluralize(minutes, 'min', 'mins'))
  }

  return {
    isMissed: false,
    countdown: `${parts.join(' ')} left`,
  }
}
