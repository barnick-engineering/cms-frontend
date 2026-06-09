import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { SampleHubItem } from '@/interface/sampleHubInterface'
import {
  getSampleHubImageUrlCandidates,
} from '@/lib/sampleHubImageUrl'
import { cn } from '@/lib/utils'

type SampleHubImageProps = {
  item: Pick<SampleHubItem, 'file_path' | 'drive_file_id' | 'id' | 'file_name'>
  variant?: 'thumb' | 'full'
  className?: string
  imgClassName?: string
}

export function SampleHubImage({
  item,
  variant = 'thumb',
  className,
  imgClassName,
}: SampleHubImageProps) {
  const candidates = getSampleHubImageUrlCandidates(item, variant)
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setCandidateIndex(0)
    setFailed(false)
  }, [item.id, item.file_path, item.drive_file_id, variant])

  const src = candidates[candidateIndex]

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground',
          className
        )}
      >
        <ImageOff className="h-8 w-8 opacity-50" />
        <span className="text-xs">Preview unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={item.file_name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn('bg-muted', imgClassName, className)}
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((i) => i + 1)
        } else {
          setFailed(true)
        }
      }}
    />
  )
}
