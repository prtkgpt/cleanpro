import { z } from 'zod'

export const createCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    unit: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().min(5, 'ZIP code is required'),
    country: z.string().default('US'),
    label: z.string().optional(),
    accessCode: z.string().optional(),
    accessInstructions: z.string().optional(),
    parkingNotes: z.string().optional(),
    squareFeet: z.number().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
  }).optional(),
})

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const createAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  unit: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US'),
  label: z.string().optional(),
  accessCode: z.string().optional(),
  accessInstructions: z.string().optional(),
  parkingNotes: z.string().optional(),
  squareFeet: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  isDefault: z.boolean().default(false),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreateAddressInput = z.infer<typeof createAddressSchema>
