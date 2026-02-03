import { BandLevel } from './BandLevel'

export interface BasePredictorDto {
  score: number
  band: `${BandLevel}`
}
