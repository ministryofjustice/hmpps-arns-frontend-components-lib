import { RequestHandler } from 'express'
import { AllPredictorVersionedDto } from '../types/dtos/allPredictorVersionedDto'
import arnsApiClientV2 from '../data/arnsApi/arnsApiClient'
import RequestOptions from '../types/RequestOptions'
import { transformBadgeData } from '../transformations/badgeTransformations'
import updateCsp from '../utils/updateCsp'

const defaultOptions: Partial<RequestOptions> = {
  logger: console,
  timeoutOptions: { response: 2500, deadline: 2500 },
}

export default function getBadgeComponent(requestOptions: RequestOptions): RequestHandler {
  const { logger, timeoutOptions } = {
    ...defaultOptions,
    ...requestOptions,
  }

  return async (req, res, next) => {
    try {
      const dtoResponse: AllPredictorVersionedDto[] = await arnsApiClientV2.fetchArnsAllPredictorData(
        res.locals.user.token,
        timeoutOptions,
        logger,
        requestOptions.identifierType,
        requestOptions.identifierValue,
      )

      res.locals.badgeComponent = {
        badgeData: transformBadgeData(dtoResponse),
        // point to the components
      }

      updateCsp(res)
      return next()
    } catch (_error) {
      logger.error('Failed to retrieve front end components')
      return next()
    }
  }
}
