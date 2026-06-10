'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ErrorBar,
} from 'recharts'
import type { BayesianVariationResult } from '@/lib/types'
import { formatPercent } from '@/lib/utils'

interface ResultsChartProps {
  variations: BayesianVariationResult[]
}

interface ChartDataPoint {
  name: string
  conversion_rate: number
  errorY: [number, number]
  chance_to_beat: number | null
  fill: string
}

export function ResultsChart({ variations }: ResultsChartProps) {
  const data: ChartDataPoint[] = variations.map((v) => ({
    name: v.name,
    conversion_rate: +(v.conversion_rate * 100).toFixed(2),
    errorY: [
      +(v.conversion_rate * 100 - v.credible_interval[0] * 100).toFixed(2),
      +(v.credible_interval[1] * 100 - v.conversion_rate * 100).toFixed(2),
    ],
    chance_to_beat: v.chance_to_beat_baseline,
    fill: v.name === 'Control' ? '#64748B' : '#4F46E5',
  }))

  const controlRate = variations.find((v) => v.name === 'Control')?.conversion_rate ?? 0

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Conversion Rate']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
            }}
          />
          <ReferenceLine
            y={+(controlRate * 100).toFixed(2)}
            stroke="#F59E0B"
            strokeDasharray="4 2"
            label={{ value: 'Baseline', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }}
          />
          <Bar dataKey="conversion_rate" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <ErrorBar
                key={entry.name}
                dataKey="errorY"
                width={6}
                strokeWidth={2}
                stroke="#94A3B8"
                direction="y"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Variation summary */}
      <div className="mt-4 space-y-3">
        {variations.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between rounded-lg border border-[#E2E8F0] dark:border-[#334155] p-3"
          >
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                {v.name}
              </p>
              <p className="text-xs text-[#64748B]">
                {v.visitors.toLocaleString()} visitors · {v.conversions} conversions
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] font-tabular">
                {formatPercent(v.conversion_rate)}
              </p>
              {v.chance_to_beat_baseline !== null && (
                <p
                  className={`text-xs font-medium font-tabular ${
                    v.chance_to_beat_baseline >= 0.95
                      ? 'text-[#10B981]'
                      : v.chance_to_beat_baseline >= 0.8
                      ? 'text-[#F59E0B]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {formatPercent(v.chance_to_beat_baseline)} chance to win
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
