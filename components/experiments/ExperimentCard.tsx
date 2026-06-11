import Link from 'next/link'
import { ExternalLink, FlaskConical } from 'lucide-react'
import { Badge, StatusDot } from '@/components/ui/Badge'
import { formatDate, formatPercent, truncate } from '@/lib/utils'
import type { Experiment } from '@/lib/types'

interface ExperimentCardProps {
  experiment: Experiment
}

export function ExperimentCard({ experiment: exp }: ExperimentCardProps) {
  return (
    <article className="group rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all hover:border-[#4F46E5]/40 hover:shadow-md dark:border-[#334155] dark:bg-[#1E293B] dark:hover:border-[#4F46E5]/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF]">
            <FlaskConical className="h-4 w-4 text-[#4F46E5]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/experiments/${exp.id}`}
              className="block text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:text-[#4F46E5] transition-colors truncate"
            >
              {exp.name}
            </Link>
            {exp.description && (
              <p className="mt-0.5 text-xs text-[#64748B] line-clamp-2">
                {truncate(exp.description, 80)}
              </p>
            )}
            {exp.target_url && (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={exp.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#64748B] hover:text-[#4F46E5] transition-colors"
                  aria-label={`Open ${exp.target_url} in new tab`}
                >
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  {truncate(exp.target_url.replace(/^https?:\/\//, ''), 40)}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={exp.status}>
            <StatusDot status={exp.status} />
            <span className="capitalize">{exp.status}</span>
          </Badge>
          {exp.primary_conversion_rate !== undefined && (
            <span className="text-xs font-medium text-[#10B981] font-tabular">
              {formatPercent(exp.primary_conversion_rate)} CVR
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-[#64748B]">
        <span>{exp.variation_count ?? 2} variations</span>
        <span aria-hidden="true">·</span>
        <span>{exp.traffic_split}% traffic split</span>
        <span aria-hidden="true">·</span>
        <span>Created {formatDate(exp.created_at)}</span>
      </div>
    </article>
  )
}
