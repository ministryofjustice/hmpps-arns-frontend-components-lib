import { BasePredictorDto } from './BasePredictorDto'
import { StaticOrDynamicPredictorDto } from './StaticOrDynamicPredictorDto'
import { VersionedStaticOrDynamicPredictorDto } from './VersionedStaticOrDynamicPredictorDto'
import { OgrScoreDto } from './OgrScoreDto'
import { OvpScoreDto } from './OvpScoreDto'
import { OgpScoreDto } from './OgpScoreDto'
import { RsrScoreDto } from './RsrScoreDto'
import { OspScoreDto } from './OspScoreDto'

export interface AllPredictorDto {
  allReoffendingPredictor?: StaticOrDynamicPredictorDto | null
  violentReoffendingPredictor?: StaticOrDynamicPredictorDto | null
  seriousViolentReoffendingPredictor?: StaticOrDynamicPredictorDto | null
  directContactSexualReoffendingPredictor?: BasePredictorDto | null
  indirectImageContactSexualReoffendingPredictor?: BasePredictorDto | null
  combinedSeriousReoffendingPredictor?: VersionedStaticOrDynamicPredictorDto | null
  groupReconvictionScore?: OgrScoreDto | null
  violencePredictorScore?: OvpScoreDto | null
  generalPredictorScore?: OgpScoreDto | null
  riskOfSeriousRecidivismScore?: RsrScoreDto | null
  sexualPredictorScore?: OspScoreDto | null
}
