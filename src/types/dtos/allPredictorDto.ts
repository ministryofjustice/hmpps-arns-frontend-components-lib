import { BasePredictorDto } from './basePredictorDto'
import { StaticOrDynamicPredictorDto } from './staticOrDynamicPredictorDto'
import { VersionedStaticOrDynamicPredictorDto } from './versionedStaticOrDynamicPredictorDto'
import { OgrScoreDto } from './ogrScoreDto'
import { OvpScoreDto } from './ovpScoreDto'
import { OgpScoreDto } from './ogpScoreDto'
import { RsrScoreDto } from './rsrScoreDto'
import { OspScoreDto } from './ospScoreDto'

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
