import { StaticOrDynamic } from './staticOrDynamic'
import { BandLevel } from './bandLevel'

export interface BadgeData {
  level: `${BandLevel}`
  score: number
  type: string
  staticOrDynamic: `${StaticOrDynamic}`
  completedDate: string
}

export interface BadgeEntry {
  [key: string]: BadgeData
}
