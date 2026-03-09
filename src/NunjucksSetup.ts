import { Environment } from 'nunjucks'
import { convertScoreToScaleMarkerPosition, convertBandToScaleMarkerPosition } from './utils/predictorUtils'

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
    bandThresholdPercentages: ['0%', '3%', '6.9%', '25%+'],
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
    showScore: true,
    hasVeryHighBand: true,
    showBandThresholdPercentages: true,
    bandThresholdPercentages: ['0%', '0.6%', '2.1%', '5.3%', '83.1%'],
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

  env.addFilter('scoreToScaleMarkerPosition', convertScoreToScaleMarkerPosition)
  env.addFilter('bandToScaleMarkerPosition', convertBandToScaleMarkerPosition)
  env.addFilter('isBefore', function isBefore(dateStr, targetDateStr = null): boolean {
    const formattedDate = dateStr.replace(' at ', ' ')
    const date = new Date(formattedDate)
    const target = targetDateStr ? new Date(targetDateStr.replace(' at ', ' ')) : new Date()
    return date < target
  })
}
