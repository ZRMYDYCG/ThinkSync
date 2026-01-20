import type { Response } from 'express'

import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name)

  constructor(private configService: ConfigService) {}

  @Post('v1/chat/completions')
  async chat(@Body() body: any, @Res() res: Response) {
    const apiKey = this.configService.get<string>('SILICON_FLOW_API_KEY')
    const baseURL = this.configService.get<string>('SILICON_FLOW_BASE_URL')

    if (!apiKey || !baseURL) {
      this.logger.error('AI configuration missing')
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'AI configuration missing',
      })
    }

    const cleanBaseURL = baseURL.replace(/\/$/, '')
    const url = `${cleanBaseURL}/chat/completions`

    this.logger.log(`Forwarding AI request to ${url} with model ${body.model}`)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger.error(`AI Proxy Error: ${response.status} ${errorText}`)
        return res.status(response.status).send(errorText)
      }

      if (body.stream) {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        if (response.body) {
          for await (const chunk of response.body) {
            res.write(chunk)
          }
        }
        res.end()
      } else {
        const data = await response.json()
        return res.json(data)
      }
    } catch (error) {
      this.logger.error('AI Proxy Exception:', error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to communicate with AI provider',
      })
    }
  }
}
