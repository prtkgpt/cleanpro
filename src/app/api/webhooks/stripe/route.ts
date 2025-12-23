import { NextRequest, NextResponse } from 'next/server'
import stripe from '@/lib/integrations/stripe'
import { handlePaymentSuccess } from '@/lib/services/payment-service'
import { headers } from 'next/headers'

// Disable body parsing for webhooks
export const runtime = 'nodejs'

// POST /api/webhooks/stripe
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        await handlePaymentSuccess(paymentIntent.id)
        console.log(`Payment succeeded: ${paymentIntent.id}`)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.error(`Payment failed: ${paymentIntent.id}`)
        // Could trigger automation to notify admin/customer
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        console.log(`Charge refunded: ${charge.id}`)
        // Refund handling is done in payment-service
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
