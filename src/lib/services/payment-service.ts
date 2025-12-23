import stripe from '@/lib/integrations/stripe'
import prisma from '@/lib/db/prisma'
import { InvoiceStatus } from '@prisma/client'

export async function createPaymentIntent(
  invoiceId: string,
  customerId: string,
  savePaymentMethod: boolean = false
) {
  // Get invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      workspace: true,
    },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  if (invoice.status === InvoiceStatus.PAID) {
    throw new Error('Invoice already paid')
  }

  // Get or create Stripe customer
  let stripeCustomerId = invoice.customer.stripeCustomerId

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: invoice.customer.email,
      name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      phone: invoice.customer.phone,
      metadata: {
        customerId: invoice.customer.id,
        workspaceId: invoice.workspaceId,
      },
    })

    stripeCustomerId = stripeCustomer.id

    // Save Stripe customer ID
    await prisma.customer.update({
      where: { id: customerId },
      data: { stripeCustomerId },
    })
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(invoice.total * 100), // Convert to cents
    currency: invoice.workspace.currency.toLowerCase(),
    customer: stripeCustomerId,
    metadata: {
      invoiceId: invoice.id,
      bookingId: invoice.bookingId,
      customerId: invoice.customerId,
      workspaceId: invoice.workspaceId,
    },
    ...(savePaymentMethod && {
      setup_future_usage: 'off_session',
    }),
  })

  // Update invoice with payment intent ID
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  })

  return paymentIntent
}

export async function handlePaymentSuccess(paymentIntentId: string) {
  // Find invoice by payment intent
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!invoice) {
    throw new Error('Invoice not found for payment intent')
  }

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    },
  })

  // Update booking status
  await prisma.booking.update({
    where: { id: invoice.bookingId },
    data: {
      status: 'PAID',
    },
  })

  return invoice
}

export async function createRefund(
  invoiceId: string,
  amount: number,
  reason?: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })

  if (!invoice) {
    throw new Error('Invoice not found')
  }

  if (!invoice.stripePaymentIntentId) {
    throw new Error('No payment intent found for this invoice')
  }

  // Create refund in Stripe
  const refund = await stripe.refunds.create({
    payment_intent: invoice.stripePaymentIntentId,
    amount: Math.round(amount * 100),
    reason: reason ? 'requested_by_customer' : undefined,
    metadata: {
      invoiceId: invoice.id,
    },
  })

  // Record refund in database
  await prisma.refund.create({
    data: {
      invoiceId: invoice.id,
      amount,
      reason,
      stripeRefundId: refund.id,
    },
  })

  // Update invoice status if fully refunded
  if (amount >= invoice.total) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.REFUNDED },
    })
  }

  return refund
}
