import prisma from '@/lib/db/prisma'
import { sendSMS } from '@/lib/integrations/twilio'
import { sendEmail } from '@/lib/integrations/email'
import { MessageType, MessageStatus } from '@prisma/client'

export async function sendMessage(
  workspaceId: string,
  type: MessageType,
  to: string,
  content: { subject?: string; body: string },
  metadata?: any
) {
  // Create message record
  const message = await prisma.message.create({
    data: {
      workspaceId,
      type,
      to,
      subject: content.subject,
      body: content.body,
      status: MessageStatus.QUEUED,
      metadata,
    },
  })

  try {
    let externalId: string | null = null

    if (type === MessageType.SMS) {
      const result = await sendSMS(to, content.body)
      externalId = result.sid

      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          twilioSid: externalId,
          sentAt: new Date(),
        },
      })
    } else if (type === MessageType.EMAIL) {
      const result = await sendEmail({
        to,
        subject: content.subject || 'CleanPro Notification',
        htmlBody: content.body,
      })
      externalId = result.messageId

      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          sendgridId: externalId,
          sentAt: new Date(),
        },
      })
    }

    return message
  } catch (error) {
    console.error('Message send error:', error)

    await prisma.message.update({
      where: { id: message.id },
      data: {
        status: MessageStatus.FAILED,
        failedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    throw error
  }
}

export async function sendBookingConfirmation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      address: true,
      service: true,
      workspace: true,
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  const date = booking.scheduledDate.toLocaleDateString()
  const time = booking.scheduledTime

  // Send SMS
  await sendMessage(
    booking.workspaceId,
    MessageType.SMS,
    booking.customer.phone,
    {
      body: `Your ${booking.service.name} is confirmed for ${date} at ${time}. Total: $${booking.total.toFixed(2)}`,
    },
    { bookingId, type: 'BOOKING_CONFIRMATION' }
  )

  // Send Email (optional)
  // await sendMessage(...)
}

export async function send24HourReminder(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      service: true,
    },
  })

  if (!booking) return

  const date = booking.scheduledDate.toLocaleDateString()
  const time = booking.scheduledTime

  await sendMessage(
    booking.workspaceId,
    MessageType.SMS,
    booking.customer.phone,
    {
      body: `Reminder: Your ${booking.service.name} is scheduled for tomorrow at ${time}.`,
    },
    { bookingId, type: 'REMINDER_24H' }
  )
}

export async function sendReviewRequest(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
    },
  })

  if (!booking) return

  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${bookingId}`

  await sendMessage(
    booking.workspaceId,
    MessageType.SMS,
    booking.customer.phone,
    {
      body: `Thanks for choosing our service! We'd love your feedback: ${reviewUrl}`,
    },
    { bookingId, type: 'REVIEW_REQUEST' }
  )
}
