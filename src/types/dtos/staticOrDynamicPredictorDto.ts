import { StaticOrDynamic } from '../staticOrDynamic'
import { BandLevel } from '../bandLevel'
import { BasePredictorDto } from './basePredictorDto'

export interface StaticOrDynamicPredictorDto extends BasePredictorDto {
  staticOrDynamic: `${StaticOrDynamic}`
}
