import { BandLevel } from '../bandLevel'

export interface OvpScoreDto {
  ovpStaticWeightedScore: number
  ovpDynamicWeightedScore: number
  ovpTotalWeightedScore: number
  oneYear: number
  twoYears: number
  ovpRisk: `${BandLevel}`
}
