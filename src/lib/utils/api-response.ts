import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

export function successResponse<T>(
  data: T,
  pagination?: ApiSuccessResponse['pagination']
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(pagination && { pagination }),
  })
}

export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
      ...(details && { details }),
    },
    { status }
  )
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return errorResponse(
      'Validation error',
      'VALIDATION_ERROR',
      400,
      error.errors
    )
  }

  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message === 'Unauthorized') {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }
    if (error.message === 'Insufficient permissions') {
      return errorResponse('Forbidden', 'FORBIDDEN', 403)
    }
    if (error.message.includes('not found')) {
      return errorResponse(error.message, 'NOT_FOUND', 404)
    }

    return errorResponse(
      error.message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    )
  }

  return errorResponse('An unexpected error occurred', 'INTERNAL_ERROR', 500)
}

export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404)
}

export function unauthorizedResponse(): NextResponse<ApiErrorResponse> {
  return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
}

export function forbiddenResponse(): NextResponse<ApiErrorResponse> {
  return errorResponse('Forbidden', 'FORBIDDEN', 403)
}

export function validationErrorResponse(
  details: any
): NextResponse<ApiErrorResponse> {
  return errorResponse('Validation error', 'VALIDATION_ERROR', 400, details)
}

export function conflictResponse(
  message: string
): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 'CONFLICT', 409)
}
