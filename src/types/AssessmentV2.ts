import { Predictor } from './Predictor'

export interface AssessmentV2 {
  outputVersion: '2'
  completedDate: string | null
  completedDateTime: string | null
  assessmentType: string
  allReoffendingPredictor?: Predictor
  violentReoffendingPredictor?: Predictor
  seriousViolentReoffendingPredictor?: Predictor
  directContactSexualReoffendingPredictor?: Predictor
  indirectImageContactSexualReoffendingPredictor?: Predictor
  combinedSeriousReoffendingPredictor?: Predictor
}
