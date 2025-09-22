// Base API configuration and types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const createApiResponse = <T>(
  data?: T,
  error?: string
): ApiResponse<T> => ({
  data,
  error,
  success: !error,
})