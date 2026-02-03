import { BasePredictorDto } from './BasePredictorDto'
import { StaticOrDynamicPredictorDto } from './StaticOrDynamicPredictorDto'
import { VersionedStaticOrDynamicPredictorDto } from './VersionedStaticOrDynamicPredictorDto'
import { OgrScoreDto } from './OgrScoreDto'
import { OvpScoreDto } from './OvpScoreDto'
import { OgpScoreDto } from './OgpScoreDto'
import { RsrScoreDto } from './RsrScoreDto'
import { OspScoreDto } from './OspScoreDto'

export interface AllPredictorDto {
  allReoffendingPredictor?: StaticOrDynamicPredictorDto
  violentReoffendingPredictor?: StaticOrDynamicPredictorDto
  seriousViolentReoffendingPredictor?: StaticOrDynamicPredictorDto
  directContactSexualReoffendingPredictor?: BasePredictorDto
  indirectImageContactSexualReoffendingPredictor?: BasePredictorDto
  combinedSeriousReoffendingPredictor?: VersionedStaticOrDynamicPredictorDto
  groupReconvictionScore?: OgrScoreDto
  violencePredictorScore?: OvpScoreDto
  generalPredictorScore?: OgpScoreDto
  riskOfSeriousRecidivismScore?: RsrScoreDto
  sexualPredictorScore?: OspScoreDto
}
