import { Environment } from 'nunjucks'
import { arnsNunjucksSetup, predictorConfig } from './NunjucksSetup'

describe('arnsNunjucksSetup', () => {
  let env: Environment

  beforeEach(() => {
    // Create a fresh Nunjucks environment for each test
    env = new Environment()
  })

  it('should add predictorConfig to global variables', () => {
    arnsNunjucksSetup(env)

    const { globals } = env as any
    expect(globals.predictorConfig).toBeDefined()
    expect(globals.predictorConfig).toEqual(predictorConfig)

    // Spot check a specific config value
    expect(globals.predictorConfig.rsr.showScore).toBe(true)
    expect(globals.predictorConfig.ospdc.showScore).toBe(false)
  })

  it('should register the scoreToScaleMarkerPosition filter', () => {
    arnsNunjucksSetup(env)

    // Check if filter exists
    const scoreToScaleMarkerPositionFilter = env.getFilter('scoreToScaleMarkerPosition')
    expect(scoreToScaleMarkerPositionFilter).toBeDefined()
    expect(typeof scoreToScaleMarkerPositionFilter).toBe('function')
  })

  it('should register the bandToScaleMarkerPosition filter', () => {
    arnsNunjucksSetup(env)

    // Check if filter exists
    const bandToScaleMarkerPositionFilter = env.getFilter('bandToScaleMarkerPosition')
    expect(bandToScaleMarkerPositionFilter).toBeDefined()
    expect(typeof bandToScaleMarkerPositionFilter).toBe('function')
  })

  it('should handle bandThresholdPercentages correctly in the config', () => {
    arnsNunjucksSetup(env)
    const { globals } = env as any

    // Verify a predictor with threshold percentages
    expect(globals.predictorConfig.ogrs3.bandThresholdPercentages).toEqual(['0%', '50%', '75%', '90%', '100%'])

    // Verify a predictor without threshold percentages
    expect(globals.predictorConfig.ospdc.bandThresholdPercentages).toBeUndefined()
  })

  it('should accurately reflect hasVeryHighBand flags', () => {
    arnsNunjucksSetup(env)
    const { predictorConfig: config } = (env as any).globals

    expect(config.ospiic.hasVeryHighBand).toBe(false)
    expect(config.ogp.hasVeryHighBand).toBe(true)
  })
})
