import { StaticOrDynamicPredictorDto } from './staticOrDynamicPredictorDto'

export interface VersionedStaticOrDynamicPredictorDto extends StaticOrDynamicPredictorDto {
  algorithmVersion: string
}
