import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

type ErrorResponseBody = {
  success: false
  statusCode: number
  message: string
  errors?: string[]
  path: string
  timestamp: string
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const isHttpException = exception instanceof HttpException
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse = isHttpException ? exception.getResponse() : null

    let message = 'Internal server error'
    let errors: string[] | undefined

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const payload = exceptionResponse as Record<string, unknown>
      const rawMessage = payload.message
      if (Array.isArray(rawMessage)) {
        errors = rawMessage.map((entry) => String(entry))
        message = 'Validation failed'
      } else if (rawMessage) {
        message = String(rawMessage)
      } else if (payload.error) {
        message = String(payload.error)
      }
    }

    const body: ErrorResponseBody = {
      success: false,
      statusCode: status,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    }

    response.status(status).json(body)
  }
}
