import { BandLevel } from './BandLevel'

export interface BasePredictorDto {
  score: number | null
  band: `${BandLevel}` | null
}
