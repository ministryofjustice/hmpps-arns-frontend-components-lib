import superagent from 'superagent'
import type bunyan from 'bunyan'
import { AllPredictorVersionedDto } from '../../types/dtos/allPredictorVersionedDto'
import TimeoutOptions from '../../types/TimeoutOptions'
import config from '../../config'

export default {
  async fetchArnsAllPredictorData(
    userToken: string,
    timeoutOptions: TimeoutOptions,
    log: bunyan | typeof console,
    identifierType: string,
    identifierValue: string,
  ): Promise<AllPredictorVersionedDto[]> {
    const result = await superagent
      .get(`${config.apis.arns.url}/risks/predictors/all/${identifierType}/${identifierValue}`)
      .retry(1, (err, _res) => {
        if (err) log.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .set({ 'x-user-token': userToken })
      .timeout(timeoutOptions)
    return result.body
  },
}
