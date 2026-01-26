import { BandLevel } from '../bandLevel'

export interface OgrScoreDto {
  oneYear: number
  twoYears: number
  scoreLevel: `${BandLevel}`
}
