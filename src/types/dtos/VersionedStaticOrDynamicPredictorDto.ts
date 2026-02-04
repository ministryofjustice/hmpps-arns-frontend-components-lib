import { StaticOrDynamicPredictorDto } from './StaticOrDynamicPredictorDto'

export interface VersionedStaticOrDynamicPredictorDto extends StaticOrDynamicPredictorDto {
  algorithmVersion: string
}
