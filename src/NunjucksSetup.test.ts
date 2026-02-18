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

  it('should register the testFilter filter', () => {
    arnsNunjucksSetup(env)

    // Check if filter exists
    const testFilter = env.getFilter('testFilter')
    expect(testFilter).toBeDefined()
    expect(typeof testFilter).toBe('function')

    // Test the filter functionality
    const result = env.renderString('{{ "hello world" | testFilter }}', {})
    expect(result).toBe('HELLO WORLD')
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
