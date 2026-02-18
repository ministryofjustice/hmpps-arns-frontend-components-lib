import { Environment } from 'nunjucks'

export const predictorConfig = {
  ogrs3: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '50%', '75%', '90%', '100%'],
  },
  ovp: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '30%', '60%', '80%', '100%'],
  },
  ogp: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '34%', '67%', '85%', '100%'],
  },
  ospdc: {
    showScore: false,
    hasVeryHighBand: true,
    showBandThresholdPercentages: false,
  },
  ospiic: {
    showScore: false,
    hasVeryHighBand: false,
    showBandThresholdPercentages: false,
  },
  rsr: {
    showScore: true,
    hasVeryHighBand: false,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '1%', '3%', '6.9%', '25%+'],
  },
  allReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '50%', '75%', '90%', '100%'],
  },
  violentReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '30%', '60%', '80%', '100%'],
  },
  seriousViolentReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '1%', '3%', '6.9%', '25%+'],
  },
  directContactSexualReoffendingPredictor: {
    showScore: false,
    hasVeryHighBand: true,
    showBandThresholdPercentages: false,
  },
  indirectImageContactSexualReoffendingPredictor: {
    showScore: false,
    hasVeryHighBand: false,
    showBandThresholdPercentages: false,
  },
  combinedSeriousReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '1%', '3%', '6.9%', '25%+'],
  },
}

export const arnsNunjucksSetup = (env: Environment) => {
  env.addGlobal('predictorConfig', predictorConfig)

  // TODO update with required filters
  env.addFilter('testFilter', (inputString: string) => {
    return inputString.toUpperCase()
  })
}
