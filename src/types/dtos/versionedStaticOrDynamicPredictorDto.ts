import { StaticOrDynamicPredictorDto } from './staticOrDynamicPredictorDto'
import { StaticOrDynamic } from '../staticOrDynamic'
import { BandLevel } from '../bandLevel'

export interface VersionedStaticOrDynamicPredictorDto extends StaticOrDynamicPredictorDto {
  algorithmVersion: string
}
