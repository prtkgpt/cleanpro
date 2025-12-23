import prisma from '@/lib/db/prisma'
import { RecurringFrequency, BookingStatus } from '@prisma/client'
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay } from 'date-fns'

/**
 * Generate bookings from a recurring rule for a given time period
 */
export async function generateRecurringBookings(
  recurringRuleId: string,
  weeksAhead: number = 12 // Generate 12 weeks by default
) {
  // Fetch the recurring rule
  const rule = await prisma.recurringRule.findUnique({
    where: { id: recurringRuleId },
    include: {
      service: true,
      skipDates: true,
      bookings: {
        select: {
          scheduledDate: true,
        },
      },
    },
  })

  if (!rule) {
    throw new Error('Recurring rule not found')
  }

  if (!rule.isActive || rule.isPaused) {
    return { created: 0, message: 'Rule is not active or paused' }
  }

  const today = startOfDay(new Date())
  const endGeneration = addWeeks(today, weeksAhead)
  const skipDatesSet = new Set(
    rule.skipDates.map(sd => startOfDay(sd.skipDate).getTime())
  )
  const existingDatesSet = new Set(
    rule.bookings.map(b => startOfDay(b.scheduledDate).getTime())
  )

  // Calculate all dates to generate bookings for
  const datesToGenerate: Date[] = []
  let currentDate = isBefore(startOfDay(rule.startDate), today)
    ? today
    : startOfDay(rule.startDate)

  while (isBefore(currentDate, endGeneration)) {
    // Check if past end date
    if (rule.endDate && isAfter(currentDate, startOfDay(rule.endDate))) {
      break
    }

    const dateTime = currentDate.getTime()

    // Check if this date should be skipped
    if (!skipDatesSet.has(dateTime) && !existingDatesSet.has(dateTime)) {
      // Check if day matches the rule
      if (shouldGenerateForDate(rule, currentDate)) {
        datesToGenerate.push(new Date(currentDate))
      }
    }

    // Move to next occurrence
    currentDate = getNextOccurrence(rule, currentDate)
  }

  // Create bookings for all dates
  const createdBookings = []
  for (const date of datesToGenerate) {
    // Calculate pricing (simplified - could use more complex logic)
    const subtotal = rule.service.basePrice
    const tax = subtotal * 0.08
    const total = subtotal + tax

    const booking = await prisma.booking.create({
      data: {
        workspaceId: rule.workspaceId,
        customerId: rule.customerId,
        addressId: rule.addressId,
        serviceId: rule.serviceId,
        recurringRuleId: rule.id,
        isRecurring: true,
        scheduledDate: date,
        scheduledTime: rule.preferredTime,
        durationMinutes: rule.service.estimatedMinutes,
        status: BookingStatus.CONFIRMED,
        subtotal,
        tax,
        total,
      },
    })

    createdBookings.push(booking)
  }

  return {
    created: createdBookings.length,
    bookings: createdBookings,
  }
}

/**
 * Check if a booking should be generated for a specific date based on the rule
 */
function shouldGenerateForDate(
  rule: { frequency: RecurringFrequency; dayOfWeek?: number | null; dayOfMonth?: number | null },
  date: Date
): boolean {
  switch (rule.frequency) {
    case 'WEEKLY':
    case 'BIWEEKLY':
      return rule.dayOfWeek !== null && date.getDay() === rule.dayOfWeek

    case 'MONTHLY':
      return rule.dayOfMonth !== null && date.getDate() === rule.dayOfMonth

    case 'CUSTOM':
      // For custom, we'll use day of week if specified
      return rule.dayOfWeek !== null ? date.getDay() === rule.dayOfWeek : true

    default:
      return false
  }
}

/**
 * Get the next occurrence date based on the recurring rule
 */
function getNextOccurrence(
  rule: { frequency: RecurringFrequency; interval: number },
  currentDate: Date
): Date {
  switch (rule.frequency) {
    case 'WEEKLY':
      return addWeeks(currentDate, rule.interval)

    case 'BIWEEKLY':
      return addWeeks(currentDate, 2 * rule.interval)

    case 'MONTHLY':
      return addMonths(currentDate, rule.interval)

    case 'CUSTOM':
      // For custom, default to weekly
      return addWeeks(currentDate, rule.interval)

    default:
      return addDays(currentDate, 1)
  }
}

/**
 * Generate bookings for all active recurring rules
 */
export async function generateAllRecurringBookings(
  workspaceId: string,
  weeksAhead: number = 12
) {
  const activeRules = await prisma.recurringRule.findMany({
    where: {
      workspaceId,
      isActive: true,
      isPaused: false,
    },
  })

  const results = []
  for (const rule of activeRules) {
    try {
      const result = await generateRecurringBookings(rule.id, weeksAhead)
      results.push({
        ruleId: rule.id,
        ...result,
      })
    } catch (error) {
      console.error(`Failed to generate bookings for rule ${rule.id}:`, error)
      results.push({
        ruleId: rule.id,
        created: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return results
}
