import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !fromNumber) {
  console.warn('Twilio credentials not configured')
}

export const twilioClient = accountSid && authToken
  ? twilio(accountSid, authToken)
  : null

export async function sendSMS(to: string, body: string) {
  if (!twilioClient || !fromNumber) {
    throw new Error('Twilio not configured')
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    })

    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
    }
  } catch (error) {
    console.error('Twilio SMS error:', error)
    throw error
  }
}
