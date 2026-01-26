import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthOptions } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type Logger from 'bunyan'
import type { ArnsComponentsConfig } from './types/ArnsComponentsConfig'
import type { RiskData } from './types/RiskData'
import type { AllPredictorVersionedDto } from './types/dtos/allPredictorVersionedDto'
import { transformBadgeData } from './components/badge/transformation'

export default class ArnsComponents {
  private readonly restClient: RestClient

  constructor(
    authenticationClient: AuthenticationClient,
    config: ArnsComponentsConfig,
    logger: Logger | Console = console,
  ) {
    this.restClient = new RestClient('ARNS API', config, logger, authenticationClient)
  }

  async getRiskData(
    authOptions: AuthOptions | string,
    identifierType: string,
    identifierValue: string,
  ): Promise<RiskData> {
    const response = await this.restClient.get<AllPredictorVersionedDto[]>(
      { path: `/risks/predictors/all/${identifierType}/${identifierValue}` },
      authOptions,
    )

    return {
      badges: transformBadgeData(response),
      raw: response,
    }
  }
}
