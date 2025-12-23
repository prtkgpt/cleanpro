// Email service using Postmark or SendGrid
// This example uses Postmark, but you can swap for SendGrid

const postmarkApiToken = process.env.POSTMARK_API_TOKEN
const fromEmail = process.env.POSTMARK_FROM_EMAIL || 'noreply@cleanpro.com'

export interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

export async function sendEmail(options: EmailOptions) {
  if (!postmarkApiToken) {
    console.warn('Email service not configured')
    throw new Error('Email service not configured')
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkApiToken,
      },
      body: JSON.stringify({
        From: fromEmail,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.htmlBody,
        TextBody: options.textBody || options.htmlBody.replace(/<[^>]*>/g, ''),
        MessageStream: 'outbound',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Postmark error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return {
      messageId: data.MessageID,
      to: data.To,
    }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

// Email templates
export function bookingConfirmationEmail(data: {
  customerName: string
  date: string
  time: string
  serviceName: string
  address: string
  total: number
}) {
  return {
    subject: `Booking Confirmation - ${data.serviceName}`,
    htmlBody: `
      <h1>Booking Confirmed!</h1>
      <p>Hi ${data.customerName},</p>
      <p>Your cleaning service has been confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${data.serviceName}</li>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Address:</strong> ${data.address}</li>
        <li><strong>Total:</strong> $${data.total.toFixed(2)}</li>
      </ul>
      <p>We look forward to serving you!</p>
    `,
  }
}

export function reminderEmail(data: {
  customerName: string
  date: string
  time: string
  serviceName: string
}) {
  return {
    subject: `Reminder: ${data.serviceName} Tomorrow`,
    htmlBody: `
      <h1>Service Reminder</h1>
      <p>Hi ${data.customerName},</p>
      <p>This is a friendly reminder that your ${data.serviceName} is scheduled for:</p>
      <p><strong>${data.date} at ${data.time}</strong></p>
      <p>See you soon!</p>
    `,
  }
}

export function reviewRequestEmail(data: {
  customerName: string
  bookingId: string
  reviewUrl: string
}) {
  return {
    subject: 'How was your cleaning service?',
    htmlBody: `
      <h1>We'd love your feedback!</h1>
      <p>Hi ${data.customerName},</p>
      <p>Thank you for choosing our service. We hope you're happy with the results!</p>
      <p>Would you mind taking a moment to leave us a review?</p>
      <p><a href="${data.reviewUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Leave a Review</a></p>
      <p>Your feedback helps us improve!</p>
    `,
  }
}
