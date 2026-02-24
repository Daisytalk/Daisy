import { NextResponse } from 'next/server'
import { logger } from './safe-logger'

export function handleApiError(
  error: unknown,
  context: string,
  meta: Record<string, unknown> = {}
): NextResponse {
  logger.error(context, {
    ...meta,
    message: error instanceof Error ? error.message : String(error),
  })
  return NextResponse.json(
    { error: 'Произошла ошибка. Попробуйте позже.' },
    { status: 500 }
  )
}
