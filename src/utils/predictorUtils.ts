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
