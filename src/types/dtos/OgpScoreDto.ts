import { BandLevel } from './BandLevel'

export interface OgpScoreDto {
  ogpStaticWeightedScore: number
  ogpDynamicWeightedScore: number
  ogpTotalWeightedScore: number
  ogp1Year: number
  ogp2Year: number
  ogpRisk: `${BandLevel}`
}
