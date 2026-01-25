import { BandLevel } from '../bandLevel'

export interface BasePredictorDto {
  score: number
  band: `${BandLevel}`
}
