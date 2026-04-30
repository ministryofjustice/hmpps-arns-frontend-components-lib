import { StaticOrDynamic } from './StaticOrDynamic'
import { BasePredictorDto } from './BasePredictorDto'

export interface StaticOrDynamicPredictorDto extends BasePredictorDto {
  staticOrDynamic: `${StaticOrDynamic}` | null
}
