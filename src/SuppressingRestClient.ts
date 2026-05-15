import type { RestClient, AuthOptions } from '@ministryofjustice/hmpps-rest-client'
import type Logger from 'bunyan'

export class SuppressingRestClient {
  constructor(
    private readonly restClient: RestClient,
    private readonly logger: Logger | Console,
  ) {}

  async get<T>(path: string, authOptions: AuthOptions | string): Promise<T | null> {
    return this.restClient.get<T | null>(
      {
        path,
        errorHandler: (requestPath, method, error) => {
          if (error.responseStatus === 404) {
            this.logger.debug(`API returned 404 (Not Found) for ${method}: ${requestPath}`)
            return null
          }
          throw error
        },
      },
      authOptions,
    )
  }
}
