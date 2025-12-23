import { z } from 'zod'
import { BookingStatus } from '@prisma/client'

export const createBookingSchema = z.object({
  customerId: z.string().cuid(),
  addressId: z.string().cuid(),
  serviceId: z.string().cuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  createInvoice: z.boolean().default(true),
})

export const updateBookingSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  completedAt: z.string().datetime().optional(),
})

export const assignCleanersSchema = z.object({
  cleanerIds: z.array(z.string().cuid()).min(1, 'At least one cleaner is required'),
})

export const startJobSchema = z.object({
  startTime: z.string().datetime().optional(),
})

export const completeJobSchema = z.object({
  notes: z.string().optional(),
  issues: z.string().optional(),
})

export const updateChecklistItemSchema = z.object({
  completed: z.boolean(),
})

export const rescheduleBookingSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newTime: z.string().regex(/^\d{2}:\d{2}$/),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type AssignCleanersInput = z.infer<typeof assignCleanersSchema>
export type StartJobInput = z.infer<typeof startJobSchema>
export type CompleteJobInput = z.infer<typeof completeJobSchema>
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>
