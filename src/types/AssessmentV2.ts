import { Predictor } from './Predictor'

export interface AssessmentV2 {
  outputVersion: "2"
  completedDateTime: string
  allReoffendingPredictor?: Predictor
  violentReoffendingPredictor?: Predictor
  seriousViolentReoffendingPredictor?: Predictor
  directContactSexualReoffendingPredictor?: Predictor;
  indirectImageContactSexualReoffendingPredictor?: Predictor;
  combinedSeriousReoffendingPredictor?: Predictor;
}