import { BandLevel } from './BandLevel'

export interface OgrScoreDto {
  oneYear: number
  twoYears: number
  scoreLevel: `${BandLevel}`
}
