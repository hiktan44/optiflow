'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Experiment } from '@/lib/types'

interface UseExperimentsOptions {
  projectId: string
  status?: string
}

export function useExperiments({ projectId, status }: UseExperimentsOptions) {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExperiments = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ project_id: projectId })
      if (status) params.set('status', status)
      const res = await fetch(`/api/experiments?${params}`)
      if (!res.ok) throw new Error('Failed to fetch experiments')
      const data = await res.json() as { experiments: Experiment[] }
      setExperiments(data.experiments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [projectId, status])

  useEffect(() => {
    fetchExperiments()
  }, [fetchExperiments])

  return { experiments, loading, error, refetch: fetchExperiments }
}
