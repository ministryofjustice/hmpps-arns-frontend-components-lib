import { BadgeEntry } from './badgeData'
import { AllPredictorVersionedDto } from './dtos/allPredictorVersionedDto'

export interface RiskData {
  badges: BadgeEntry[]

  // TODO: Add other component data types as they are implemented
  // scales: ScaleScore[]
  // timeline: TimelineEntry[]
  // legacyScores: LegacyScore[]

  raw: AllPredictorVersionedDto[]
}
