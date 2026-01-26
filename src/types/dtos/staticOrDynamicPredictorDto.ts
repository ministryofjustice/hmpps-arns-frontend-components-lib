import { StaticOrDynamic } from '../staticOrDynamic'
import { BasePredictorDto } from './basePredictorDto'

export interface StaticOrDynamicPredictorDto extends BasePredictorDto {
  staticOrDynamic: `${StaticOrDynamic}`
}
