import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type { AuthOptions } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type Logger from 'bunyan'
import type { ArnsComponentsConfig } from './types/ArnsComponentsConfig'
import type { RiskData } from './types/RiskData'
import type { AllPredictorVersionedDto } from './types/dtos/AllPredictorVersionedDto'
import { transformAllPredictorVersionedDtoToAssessments } from './transformers/AllPredictorVersionedDtoToAssessmentsTransformer'
import { RoshData } from './types/RoshData'
import { AllRoshRiskDto } from './types/dtos/AllRoshRiskDto'
import { transformAllRoshRiskDtoToRoshData } from './transformers/AllRoshRiskDtoToRoshDataTransformer'
import { SuppressingRestClient } from './SuppressingRestClient'

export default class ArnsComponents {
  private readonly arnsApiRestClient: SuppressingRestClient

  private readonly logger: Logger | Console

  constructor(
    authenticationClient: AuthenticationClient,
    config: ArnsComponentsConfig,
    logger: Logger | Console = console,
  ) {
    this.logger = logger
    this.arnsApiRestClient = new SuppressingRestClient(
      new RestClient('ARNS API', config, logger, authenticationClient),
      logger,
    )
  }

  async getRiskData(
    authOptions: AuthOptions | string,
    identifierType: string,
    identifierValue: string,
  ): Promise<RiskData> {
    try {
      const response: AllPredictorVersionedDto[] | null = await this.arnsApiRestClient.get<AllPredictorVersionedDto[]>(
        `/risks/predictors/all/${identifierType}/${identifierValue}`,
        authOptions,
      )

      if (!response) {
        return { assessments: [], httpStatus: 404 }
      }

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

  async getRoshData(authOptions: AuthOptions | string, identifierValue: string): Promise<RoshData> {
    try {
      const response: AllRoshRiskDto | null = await this.arnsApiRestClient.get<AllRoshRiskDto>(
        `/risks/crn/${identifierValue}`,
        authOptions,
      )

      if (!response) {
        return { assessment: null, httpStatus: 404 }
      }

      return {
        assessment: transformAllRoshRiskDtoToRoshData(response),
        httpStatus: 200,
      }
    } catch (error) {
      const status = error && typeof error === 'object' && 'status' in error ? (error as any).status : 500
      return {
        assessment: null,
        httpStatus: status ?? 500,
      }
    }
  }
}
