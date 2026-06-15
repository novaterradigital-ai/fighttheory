import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const VIP_PRICE_ID = process.env.STRIPE_VIP_PRICE_ID || 'price_vip_monthly'
export const VIP_AMOUNT = 6700 // $67.00 in cents
