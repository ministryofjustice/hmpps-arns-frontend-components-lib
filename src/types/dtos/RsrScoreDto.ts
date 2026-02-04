import { StaticOrDynamic } from './StaticOrDynamic'
import { BandLevel } from './BandLevel'
import { RsrScoreSourceDto } from './RsrScoreSourceDto'

export interface RsrScoreDto {
  percentageScore: number
  staticOrDynamic: `${StaticOrDynamic}`
  source: `${RsrScoreSourceDto}`
  algorithmVersion: string
  scoreLevel: `${BandLevel}`
}
