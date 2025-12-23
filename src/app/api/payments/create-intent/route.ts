import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/session'
import { createPaymentIntent } from '@/lib/services/payment-service'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { z } from 'zod'

const createIntentSchema = z.object({
  invoiceId: z.string().cuid(),
  savePaymentMethod: z.boolean().default(false),
})

// POST /api/payments/create-intent
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const validatedData = createIntentSchema.parse(body)

    const paymentIntent = await createPaymentIntent(
      validatedData.invoiceId,
      session.user.id,
      validatedData.savePaymentMethod
    )

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
