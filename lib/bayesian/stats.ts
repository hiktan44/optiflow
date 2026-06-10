const MONTE_CARLO_SAMPLES = 10_000

function betaSample(alpha: number, beta: number): number {
  // Johnk's method for beta sampling
  let x = 0
  let y = 0
  do {
    x = Math.pow(Math.random(), 1 / alpha)
    y = Math.pow(Math.random(), 1 / beta)
  } while (x + y > 1)
  return x / (x + y)
}

function betaMean(alpha: number, beta: number): number {
  return alpha / (alpha + beta)
}

function betaCredibleInterval(
  alpha: number,
  beta: number,
  samples: number = MONTE_CARLO_SAMPLES
): [number, number] {
  const draws = Array.from({ length: samples }, () => betaSample(alpha, beta))
  draws.sort((a, b) => a - b)
  const lower = draws[Math.floor(samples * 0.025)]
  const upper = draws[Math.floor(samples * 0.975)]
  return [lower, upper]
}

export interface VariationStats {
  visitors: number
  conversions: number
}

export interface BayesianResult {
  conversion_rate: number
  chance_to_beat_baseline: number | null
  expected_improvement: number | null
  credible_interval: [number, number]
}

export function computeBayesianResults(
  control: VariationStats,
  variation: VariationStats
): { control: BayesianResult; variation: BayesianResult } {
  // Beta prior: Beta(1, 1) = Uniform
  const controlAlpha = 1 + control.conversions
  const controlBeta = 1 + control.visitors - control.conversions
  const varAlpha = 1 + variation.conversions
  const varBeta = 1 + variation.visitors - variation.conversions

  const controlRate = betaMean(controlAlpha, controlBeta)
  const varRate = betaMean(varAlpha, varBeta)

  // Monte Carlo: P(variation > control)
  let variationWins = 0
  let totalImprovement = 0
  for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
    const c = betaSample(controlAlpha, controlBeta)
    const v = betaSample(varAlpha, varBeta)
    if (v > c) {
      variationWins++
      totalImprovement += v - c
    }
  }

  const chanceToWin = variationWins / MONTE_CARLO_SAMPLES
  const expectedImprovement =
    variationWins > 0 ? totalImprovement / variationWins : 0

  return {
    control: {
      conversion_rate: controlRate,
      chance_to_beat_baseline: null,
      expected_improvement: null,
      credible_interval: betaCredibleInterval(controlAlpha, controlBeta),
    },
    variation: {
      conversion_rate: varRate,
      chance_to_beat_baseline: chanceToWin,
      expected_improvement: expectedImprovement,
      credible_interval: betaCredibleInterval(varAlpha, varBeta),
    },
  }
}
