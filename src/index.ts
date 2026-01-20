import getBadgeData from './services/arnsApiService'

export default {
  /**
   * Returns a request handler for adding frontend components to res.locals
   *
   * Adds stringified html for each component along with lists of css javascript links.
   *
   * Expects nunjucks and res.locals.user to be set up inline with the hmpps-template-typescript project
   *
   * @param requestOptions - config object for request
   * @param requestOptions.identifierType - type of assessment identifier (crn)
   * @param requestOptions.identifierValue - value of assessment identifier (x123456)
   * @param requestOptions.environmentName - if you require environment tags on the fallback banner "DEV", "PRE-PRODUCTION" or "PRODUCTION" can be passed in
   * @param requestOptions.logger - pass in the bunyen logger if you want to use it. Falls back to console if not provided
   * @param requestOptions.timeoutOptions - timeout object for superagent. Defaults to 2500ms
   * @param requestOptions.useFallbacksByDefault - if your service requires only the basic fallback component to be used by default, set this to true, it will not attempt to fetch data from arns api
   */
  getBadgeData,
}
