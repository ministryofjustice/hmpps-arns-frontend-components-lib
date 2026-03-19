import { Environment } from 'nunjucks'
import { arnsNunjucksSetup, predictorConfig } from './NunjucksSetup'

describe('arnsNunjucksSetup', () => {
  let env: Environment

  beforeEach(() => {
    env = new Environment()
    arnsNunjucksSetup(env)
  })

  it('should add predictorConfig to global variables', () => {
    const { globals } = env as any
    expect(globals.predictorConfig).toBeDefined()
    expect(globals.predictorConfig).toEqual(predictorConfig)
    expect(globals.predictorConfig.rsr.showScore).toBe(true)
    expect(globals.predictorConfig.ospdc.showScore).toBe(false)
  })

  it('should register the scoreToScaleMarkerPosition filter', () => {
    const scoreToScaleMarkerPositionFilter = env.getFilter('scoreToScaleMarkerPosition')
    expect(scoreToScaleMarkerPositionFilter).toBeDefined()
    expect(typeof scoreToScaleMarkerPositionFilter).toBe('function')
  })

  it('should register the bandToScaleMarkerPosition filter', () => {
    const bandToScaleMarkerPositionFilter = env.getFilter('bandToScaleMarkerPosition')
    expect(bandToScaleMarkerPositionFilter).toBeDefined()
    expect(typeof bandToScaleMarkerPositionFilter).toBe('function')
  })

  it('should handle bandThresholdPercentages correctly in the config', () => {
    const { globals } = env as any
    expect(globals.predictorConfig.ogrs3.bandThresholdPercentages).toEqual(['0%', '50%', '75%', '90%', '100%'])
    expect(globals.predictorConfig.ospdc.bandThresholdPercentages).toBeUndefined()
  })

  it('should accurately reflect hasVeryHighBand flags', () => {
    const { predictorConfig: config } = (env as any).globals
    expect(config.ospiic.hasVeryHighBand).toBe(false)
    expect(config.ogp.hasVeryHighBand).toBe(true)
  })

  it('should register the probabilityStatement filter', () => {
    const probabilityStatementFilter = env.getFilter('probabilityStatement')
    expect(probabilityStatementFilter).toBeDefined()
    expect(typeof probabilityStatementFilter).toBe('function')
  })

  it('should register the isBefore filter', () => {
    const isBeforeFilter = env.getFilter('isBefore')
    expect(isBeforeFilter).toBeDefined()
    expect(typeof isBeforeFilter).toBe('function')
  })
})
