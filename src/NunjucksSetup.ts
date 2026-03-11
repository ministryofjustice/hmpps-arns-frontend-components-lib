import { Environment } from 'nunjucks'
import { convertScoreToScaleMarkerPosition, convertBandToScaleMarkerPosition } from './utils/predictorUtils'

export const predictorConfig = {
  ogrs3: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '50%', '75%', '90%', '100%'],
    hasStaticOrDynamic: false,
  },
  ovp: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '30%', '60%', '80%', '100%'],
    hasStaticOrDynamic: false,
  },
  ogp: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '34%', '67%', '85%', '100%'],
    hasStaticOrDynamic: false,
  },
  ospdc: {
    showScore: false,
    hasVeryHighBand: true,
    showBandThresholdPercentages: false,
    hasStaticOrDynamic: false,
  },
  ospiic: {
    showScore: false,
    hasVeryHighBand: false,
    showBandThresholdPercentages: false,
    hasStaticOrDynamic: false,
  },
  rsr: {
    showScore: true,
    hasVeryHighBand: false,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '3%', '6.9%', '25%+'],
    hasStaticOrDynamic: true,
  },
  allReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '50%', '75%', '90%', '100%'],
    hasStaticOrDynamic: true,
  },
  violentReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '30%', '60%', '80%', '100%'],
    hasStaticOrDynamic: true,
  },
  seriousViolentReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '1%', '3%', '6.9%', '25%+'],
    hasStaticOrDynamic: true,
  },
  directContactSexualReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '0.6%', '2.1%', '5.3%', '83.1%'],
    hasStaticOrDynamic: false,
  },
  indirectImageContactSexualReoffendingPredictor: {
    showScore: false,
    hasVeryHighBand: false,
    showBandThresholdPercentages: false,
    hasStaticOrDynamic: false,
  },
  combinedSeriousReoffendingPredictor: {
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '1%', '3%', '6.9%', '25%+'],
    hasStaticOrDynamic: true,
  },
}

export const arnsNunjucksSetup = (env: Environment) => {
  env.addGlobal('predictorConfig', predictorConfig)

  env.addFilter('scoreToScaleMarkerPosition', convertScoreToScaleMarkerPosition)
  env.addFilter('bandToScaleMarkerPosition', convertBandToScaleMarkerPosition)
}
