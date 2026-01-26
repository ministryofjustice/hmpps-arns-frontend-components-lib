import { BandLevel } from '../bandLevel'

export interface OspScoreDto {
  ospIndecentPercentageScore: number
  ospContactPercentageScore: number
  ospIndecentScoreLevel: `${BandLevel}`
  ospContactScoreLevel: `${BandLevel}`
}
