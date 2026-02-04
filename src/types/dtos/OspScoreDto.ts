import { BandLevel } from './BandLevel'

export interface OspScoreDto {
  ospIndecentPercentageScore: number
  ospContactPercentageScore: number
  ospIndecentScoreLevel: `${BandLevel}`
  ospContactScoreLevel: `${BandLevel}`
}
