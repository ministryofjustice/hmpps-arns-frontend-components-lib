import { BandLevel } from '../bandLevel'

export interface OgpScoreDto {
  ogpStaticWeightedScore: number
  ogpDynamicWeightedScore: number
  ogpTotalWeightedScore: number
  ogp1Year: number
  ogp2Year: number
  ogpRisk: `${BandLevel}`
}
