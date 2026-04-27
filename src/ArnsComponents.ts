import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthOptions } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type Logger from 'bunyan'
import type { ArnsComponentsConfig } from './types/ArnsComponentsConfig'
import type { RiskData } from './types/RiskData'
import type { AllPredictorVersionedDto } from './types/dtos/AllPredictorVersionedDto'
import { transformAllPredictorVersionedDtoToAssessments } from './transformers/AllPredictorVersionedDtoToAssessmentsTransformer'

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
    try {
      const response = await this.restClient.get<AllPredictorVersionedDto[]>(
        { path: `/risks/predictors/all/${identifierType}/${identifierValue}` },
        authOptions,
      )

      return {
        assessments: transformAllPredictorVersionedDtoToAssessments(response),
        httpStatus: 200,
      }
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? (error as any).status : 500
      return {
        assessments: [],
        httpStatus: status ?? 500,
      }
    }
  }
}
