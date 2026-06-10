import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_for_build', {
  apiVersion: '2025-02-24.acacia',
})

export const PRICE_IDS = {
  free: process.env.STRIPE_FREE_PRICE_ID ?? '',
  pro: process.env.STRIPE_PRO_PRICE_ID ?? '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? '',
} as const
