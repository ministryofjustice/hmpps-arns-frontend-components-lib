import { StaticOrDynamic } from '../staticOrDynamic'
import { BandLevel } from '../bandLevel'
import { RsrScoreSourceDto } from './rsrScoreSourceDto'

export interface RsrScoreDto {
  percentageScore: number
  staticOrDynamic: `${StaticOrDynamic}`
  source: `${RsrScoreSourceDto}`
  algorithmVersion: string
  scoreLevel: `${BandLevel}`
}
