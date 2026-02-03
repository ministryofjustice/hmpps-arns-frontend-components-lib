import { BandLevel } from './BandLevel'

export interface OvpScoreDto {
  ovpStaticWeightedScore: number
  ovpDynamicWeightedScore: number
  ovpTotalWeightedScore: number
  oneYear: number
  twoYears: number
  ovpRisk: `${BandLevel}`
}
