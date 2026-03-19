import { RiskData } from '../types/RiskData'

export type Band = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH' | 'NOT APPLICABLE'

export const convertScoreToScaleMarkerPosition = (score: number, thresholds: (number | string)[]): string => {
  const numericThresholds: number[] = thresholds.map(t => {
    if (typeof t === 'number') return t

    const sanitised = t.replace(/[^0-9.]/g, '')
    const parsed = parseFloat(sanitised)

    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid threshold value: ${t}`)
    }
    return parsed
  })

  if (numericThresholds.length < 2) {
    throw new Error('Thresholds must contain at least two values')
  } else if (numericThresholds[0] !== 0) {
    throw new Error('The lowest threshold must be 0')
  }

  const numSegments = numericThresholds.length - 1
  const segmentWeight = 100 / numSegments

  for (let i = 0; i < numSegments; i += 1) {
    const lower = numericThresholds[i]
    const upper = numericThresholds[i + 1]

    if (score >= lower && score <= upper) {
      const progressInSegment = (score - lower) / (upper - lower)
      const totalPercentage = i * segmentWeight + progressInSegment * segmentWeight

      return totalPercentage.toFixed(2)
    }
  }

  return '100.00'
}

export const convertBandToScaleMarkerPosition = (band: Band, hasVeryHighBand: boolean): number => {
  if (!hasVeryHighBand && band === 'VERY HIGH') {
    throw new Error('Band cannot be set to VERY HIGH if hasVeryHighBand=false')
  }

  switch (band) {
    case 'LOW':
      return hasVeryHighBand ? 12.5 : 16.66
    case 'MEDIUM':
      return hasVeryHighBand ? 37.5 : 50
    case 'HIGH':
      return hasVeryHighBand ? 62.5 : 83.33
    case 'VERY HIGH':
      return 87.5
    case 'NOT APPLICABLE':
      return 0
    default:
      throw new Error(`Unexpected band ${band}`)
  }
}

export const containsCompletedAssessment = (data: RiskData): boolean => {
  return data?.httpStatus === 200 && (data?.assessments?.length ?? 0) > 0
}

export const isBefore = (dateStr: string, targetDateStr: string = null): boolean => {
  const formattedDate = dateStr.replace(' at ', ' ')
  const date = new Date(formattedDate)
  const target = targetDateStr ? new Date(targetDateStr.replace(' at ', ' ')) : new Date()
  return date < target
}

export const probabilityStatement = (inputScore?: number): string => {
  if (inputScore === null || inputScore === undefined) return 'Error: score is null or undefined.'

  // Normalise input (e.g. 12.34 becomes 0.1234)
  const score = inputScore / 100

  // Guardrails
  if (score < 0.01) return `Less than 1 in 100 people (${inputScore}%)`
  if (score > 0.99) return `More than 99 in 100 people (${inputScore}%)`

  const DENOMINATORS = [2, 3, 4, 5, 8, 10, 20, 25, 50, 100]
  const isHumanZone = score >= 0.2 && score <= 0.8
  const humanTolerance = 0.025

  // Init variables
  let bestNum = 0
  let bestDenom = 100
  let minErrorFound = Infinity

  // Find the match
  for (const denominator of DENOMINATORS) {
    const numerator = Math.max(Math.round(score * denominator), 1)
    const currentVal = numerator / denominator
    const currentError = Math.abs(score - currentVal)

    // Find the simplest (break) denominator possible when score is 20% to 80%
    if (isHumanZone && currentError <= humanTolerance) {
      bestNum = numerator
      bestDenom = denominator
      break
    }

    // Find the most accurate match when score 1% to 19.99% or 80.01% to 99%
    if (!isHumanZone && currentError < minErrorFound - 1e-10) {
      bestNum = numerator
      bestDenom = denominator
      minErrorFound = currentError
    }
  }

  // About prefix
  const isExact = Math.abs(score - bestNum / bestDenom) < 1e-10
  const prefix = isExact ? '' : 'About '

  return `${prefix}${bestNum} in ${bestDenom} people (${inputScore}%)`
}
