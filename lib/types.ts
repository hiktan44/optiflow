export type Plan = 'free' | 'pro' | 'enterprise'
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed'
export type EventType = 'assignment' | 'conversion' | 'pageview'
export type GoalType = 'click' | 'pageview' | 'custom'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  stripe_customer_id: string | null
  mtu_limit: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  domain: string
  snippet_key: string
  is_verified: boolean
  created_at: string
  updated_at: string
  experiment_count?: number
}

export interface Experiment {
  id: string
  project_id: string
  name: string
  description: string | null
  status: ExperimentStatus
  target_url: string
  traffic_split: number
  targeting: TargetingRules
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
  variation_count?: number
  primary_conversion_rate?: number
}

export interface Variation {
  id: string
  experiment_id: string
  name: string
  index: number
  changes: DomChange[]
  created_at: string
}

export interface Goal {
  id: string
  experiment_id: string
  name: string
  type: GoalType
  selector: string | null
  url_pattern: string | null
  is_primary: boolean
  created_at: string
}

export interface Event {
  id: string
  project_id: string
  experiment_id: string | null
  variation_id: string | null
  goal_id: string | null
  session_id: string
  visitor_id: string
  event_type: EventType
  metadata: Record<string, unknown>
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  plan: Plan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type DomChangeType = 'text' | 'style' | 'attribute' | 'visibility'

export interface DomChange {
  type: DomChangeType
  selector: string
  value?: string
  property?: string
  attribute?: string
  visible?: boolean
}

export interface TargetingRules {
  device?: ('desktop' | 'mobile' | 'tablet')[]
  language?: string[]
  utm_source?: string[]
  visitor_type?: 'new' | 'returning'
}

export interface BayesianVariationResult {
  id: string
  name: string
  visitors: number
  conversions: number
  conversion_rate: number
  chance_to_beat_baseline: number | null
  expected_improvement: number | null
  credible_interval: [number, number]
}

export interface ExperimentResults {
  experiment_id: string
  status: ExperimentStatus
  total_visitors: number
  variations: BayesianVariationResult[]
}

export interface CreateExperimentInput {
  project_id: string
  name: string
  description?: string
  target_url: string
  traffic_split: number
  targeting: TargetingRules
  variations: {
    name: string
    index: number
    changes: DomChange[]
  }[]
  goals: {
    name: string
    type: GoalType
    selector?: string
    url_pattern?: string
    is_primary: boolean
  }[]
}
